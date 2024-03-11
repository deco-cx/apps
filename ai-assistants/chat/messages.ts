import {
  AssistantCreateParams,
  RequiredActionFunctionToolCall,
  Thread,
} from "../deps.ts";
import { threadMessageToReply, Tokens } from "../loaders/messages.ts";
import { JSONSchema7, ValueType, weakcache } from "deco/deps.ts";
import { lazySchemaFor } from "deco/engine/schema/lazy.ts";
import { Context } from "deco/live.ts";
import { meter } from "deco/observability/otel/metrics.ts";
import {
  ChatMessage,
  FunctionCallReply,
  Reply,
  ReplyMessage,
} from "../actions/chat.ts";
import { AIAssistant, AppContext } from "../mod.ts";
import { dereferenceJsonSchema } from "../schema.ts";

const stats = {
  latency: meter.createHistogram("assistant_latency", {
    description:
      "assistant latency (time it takes from the moment the server receives the request to the moment it sends the response)",
    unit: "ms",
    valueType: ValueType.DOUBLE,
  }),
};

// Max length of instructions. The maximum context of the assistant is 32K chars. We use 25K for instructions to be safe.
const MAX_INSTRUCTIONS_LENGTH = 25000;

const notUndefined = <T>(v: T | undefined): v is T => v !== undefined;

const toolsCache = new weakcache.WeakLRUCache({
  cacheSize: 16, // up to 16 different schemas stored here.
});

/**
 * Builds assistant tools that can be used by OpenAI assistant to execute actions based on users requests.
 * @param assistant the assistant that will handle the request
 * @returns an array of available functions that can be used.
 */
const appTools = async (assistant: AIAssistant): Promise<
  AssistantCreateParams.AssistantToolsFunction[]
> => {
  const ctx = Context.active();
  const assistantsKey = assistant.availableFunctions?.join(",") ?? "all";
  const revision = await ctx.release!.revision();
  const cacheKey = `${assistantsKey}@${revision}`;
  if (toolsCache.has(cacheKey)) {
    return toolsCache.get(cacheKey)!;
  }
  const toolsPromise = ctx.runtime!.then(async (runtime) => {
    const schemas = await lazySchemaFor(ctx).value;
    const functionKeys = assistant.availableFunctions ?? Object.keys({
      ...runtime.manifest.loaders,
      ...runtime.manifest.actions,
    });
    const tools = functionKeys.map(
      (functionKey) => {
        const functionDefinition = btoa(functionKey);
        const schema = schemas.definitions[functionDefinition];
        if ((schema as { ignoreAI?: boolean })?.ignoreAI) {
          return undefined;
        }
        const propsRef = (schema?.allOf?.[0] as JSONSchema7)?.$ref;
        if (!propsRef) {
          return undefined;
        }
        const dereferenced = dereferenceJsonSchema({
          $ref: propsRef,
          ...schemas,
        });
        if (
          dereferenced.type !== "object" ||
          (dereferenced.oneOf || dereferenced.anyOf ||
            dereferenced?.allOf || dereferenced?.enum || dereferenced?.not)
        ) {
          return undefined;
        }
        return {
          type: "function" as const,
          function: {
            name: functionKey,
            description:
              `Usage for: ${schema?.description}. Example: ${schema?.examples}`,
            parameters: {
              ...dereferenced,
              definitions: undefined,
              root: undefined,
            },
          },
        };
      },
    ).filter(notUndefined);

    toolsCache.set(ctx, tools);
    return tools;
  });
  toolsCache.set(cacheKey, toolsPromise);
  return toolsPromise;
};

export interface ProcessorOpts {
  assistantId: string;
  instructions: string;
}

const sleep = (ns: number) => new Promise((resolve) => setTimeout(resolve, ns));

const cache: Record<string, unknown> = {};

const invokeFor = (
  ctx: AppContext,
  assistant: AIAssistant,
  onFunctionCallStart: (
    tool: RequiredActionFunctionToolCall,
    props: unknown,
  ) => void,
  onFunctionCallEnd: (
    tool: RequiredActionFunctionToolCall,
    props: unknown,
    response: unknown,
  ) => void,
) => {
  return async (call: RequiredActionFunctionToolCall) => {
    try {
      const props = JSON.parse(call.function.arguments || "{}");

      const cacheKey = `${call.function.arguments}${call.function.name}`;

      const assistantProps = assistant?.useProps?.(props) ?? props;
      cache[cacheKey] ??= ctx.invoke(
        // deno-lint-ignore no-explicit-any
        call.function.name as any,
        assistantProps,
      );
      onFunctionCallStart(call, assistantProps);
      const invokeResponse = await cache[cacheKey];
      onFunctionCallEnd(call, assistantProps, invokeResponse);
      return {
        tool_call_id: call.id,
        output: JSON.stringify(invokeResponse),
      };
    } catch (err) {
      console.error("invoke error", err);
      return {
        tool_call_id: call.id,
        output: "[]",
      };
    }
  };
};
/**
 * Creates a message processor function for the given AI assistant and context.
 * @param {AIAssistant} assistant - The AI assistant for processing messages.
 * @param {AppContext} ctx - The application context.
 * @returns {Promise<(message: ChatMessage) => void>} - A function that processes incoming chat messages.
 */
export const messageProcessorFor = async (
  assistant: AIAssistant,
  ctx: AppContext,
  thread: Thread,
) => {
  const openAI = ctx.openAI;
  const threads = openAI.beta.threads;
  const instructions =
    `${ctx.instructions}. Introduce yourself as ${assistant.name}. ${assistant.instructions}. The files uploaded to the assistant should 
    give you a good context of how the products you are dealing with are formatted. ${
      assistant.prompts
        ? "Below are arbitrary prompt that gives you information about the current context, it can be empty."
        : ""
    }\n${
      (assistant.prompts ?? []).map((prompt) =>
        `this is the ${prompt.context}: ${prompt.content}`
      )
    }. DO NOT CHANGE FUNCTIONS NAMES, do not remove .ts at the end of function name. do not remove / at the end of function name. 
    If you are positive that your response contains the information that the user requests (like product descriptions, product names, prices, colors, and sizes), add an ${Tokens.POSITIVE} symbol at the end of the phrase. Otherwise, add a ${Tokens.NEGATIVE} symbol.
    For example, if the user asks about product availability and you have the information, respond with "The product is in stock. @". If you don't have the information, respond with "I'm sorry, the product is currently unavailable. ${Tokens.NEGATIVE}".
    `;
  const assistantId = await ctx.assistant.then((assistant) => assistant.id);
  const tools = await appTools(assistant);

  // Update the assistant object with the thread and assistant id
  assistant.threadId = thread.id;
  assistant.id = assistantId;

  /**
   * Processes an incoming chat message.
   * @param {ChatMessage} message - The incoming chat message.
   * @returns {Promise<void>} - A promise representing the completion of message processing.
   */
  return async ({ text: content, reply: _reply }: ChatMessage) => {
    // send message
    const start = performance.now();
    await threads.messages.create(thread.id, {
      content,
      role: "user",
    });
    // create run
    const run = await threads.runs.create(thread.id, {
      model: typeof assistant.model === "object"
        ? assistant.model.custom
        : assistant.model,
      assistant_id: assistantId,
      instructions: instructions.slice(0, MAX_INSTRUCTIONS_LENGTH),
      tools,
    });

    const messageId = run.id;
    // Wait for the assistant answer
    const functionCallReplies: FunctionCallReply<unknown>[] = [];

    // Reply to the user
    const reply = (message: Reply<unknown>) => {
      assistant.onMessageSent?.({
        assistantId: run.assistant_id,
        threadId: thread.id,
        runId: run.id,
        model: run.model,
        message,
      });
      return _reply(message);
    };

    assistant.onMessageReceived?.({
      assistantId: run.assistant_id,
      threadId: thread.id,
      runId: run.id,
      model: run.model,
      message: { type: "text", value: content },
    });

    const invoke = invokeFor(ctx, assistant, (call, props) => {
      reply({
        threadId: thread.id,
        messageId,
        type: "start_function_call",
        content: {
          name: call.function.name,
          props,
        },
      });
      stats.latency.record(performance.now() - start, {
        type: "start_function_call",
        assistant_id: run.assistant_id,
      });
    }, (call, props, response) => {
      functionCallReplies.push({
        name: call.function.name,
        props,
        response,
      });
    });

    let runStatus;
    do {
      runStatus = await threads.runs.retrieve(
        thread.id,
        run.id,
      );

      if (runStatus.status === "requires_action") {
        const actions = runStatus.required_action!;
        const outputs = actions.submit_tool_outputs;

        const tool_outputs = await Promise.all(
          outputs.tool_calls.map(invoke),
        );
        if (tool_outputs.length === 0) {
          const message: ReplyMessage = {
            messageId: Date.now().toString(),
            threadId: thread.id,
            type: "error",
            content: [],
            role: "assistant",
          };
          reply(message);
          return;
        }
        await threads.runs.submitToolOutputs(
          thread.id,
          run.id,
          {
            tool_outputs,
          },
        );
        runStatus = await threads.runs.retrieve(
          thread.id,
          run.id,
        );
      }
      await sleep(500);
    } while (["in_progress", "queued"].includes(runStatus.status));

    const messages = await threads.messages.list(thread.id);
    const threadMessages = messages.data;
    const lastMsg = threadMessages
      .findLast((message) =>
        message.run_id == run.id && message.role === "assistant"
      );

    if (!lastMsg) {
      // TODO(@mcandeia) in some cases the bot didn't respond anything.
      const message: ReplyMessage = {
        messageId: Date.now().toString(),
        threadId: thread.id,
        type: "error",
        content: [],
        role: "assistant",
      };
      reply(message);
      return;
    }

    const replyMessage = threadMessageToReply(lastMsg);

    // multi tool use parallel seems to be some sort of openai bug, and it seems to have no solution yet.
    // https://community.openai.com/t/model-tries-to-call-unknown-function-multi-tool-use-parallel/490653
    // It's an error that only happens every now and then. Open ai tries to call "multi_tool_use.parallel" function that doesn't even exist and isn't even in the OpenAI documentation
    // If functionCallReplies is not an array it should also be considered an error
    if (
      (functionCallReplies.length === 1 &&
        functionCallReplies[0].name === "multi_tool_use.parallel") ||
      !Array.isArray(functionCallReplies)
    ) {
      const message: ReplyMessage = {
        messageId: Date.now().toString(),
        threadId: thread.id,
        type: "error",
        content: [],
        role: "assistant",
      };
      reply(message);
    } else {
      reply(replyMessage);
      stats.latency.record(performance.now() - start, {
        type: "text",
        assistant_id: run.assistant_id,
      });
    }

    if (functionCallReplies.length > 0) {
      reply({
        threadId: thread.id,
        messageId,
        type: "function_calls" as const,
        content: functionCallReplies,
      });
      stats.latency.record(performance.now() - start, {
        type: "function_calls",
        assistant_id: run.assistant_id,
      });
    }
  };
};

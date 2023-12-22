import {
  AssistantCreateParams,
  RequiredActionFunctionToolCall,
  Thread,
} from "../deps.ts";
import { getToken, threadMessageToReply, Tokens } from "../loaders/messages.ts";

import { JSONSchema7 } from "deco/deps.ts";
import { genSchemas } from "deco/engine/schema/reader.ts";
import { Context } from "deco/live.ts";
import { AppManifest } from "deco/mod.ts";
import { mschema } from "deco/runtime/fresh/routes/_meta.ts";
import { ChatMessage, FunctionCallReply } from "../actions/chat.ts";
import { AIAssistant, AppContext } from "../mod.ts";
import { dereferenceJsonSchema } from "../schema.ts";
import type { Product } from "../../commerce/types.ts";

const notUndefined = <T>(v: T | undefined): v is T => v !== undefined;
let tools: Promise<AssistantCreateParams.AssistantToolsFunction[]> | null =
  null;

/**
 * Select functions from manifest based on the available functions or pickall loaders and actions.
 */
const pickFunctions = (
  funcs: string[],
  { name, baseUrl, ...blocks }: AppManifest,
): AppManifest => {
  const newManifest: AppManifest = { name, baseUrl };
  for (const [blockType, blockValues] of Object.entries(blocks)) {
    for (const blockKey of Object.keys(blockValues)) {
      if (funcs.includes(blockKey)) {
        newManifest[
          blockType as keyof Omit<AppManifest, "name" | "baseUrl">
        ] ??= {};
        newManifest[blockType as keyof Omit<AppManifest, "name" | "baseUrl">]![
          blockKey
        ] = blockValues[blockKey];
      }
    }
  }
  return newManifest;
};
/**
 * Builds assistant tools that can be used by OpenAI assistant to execute actions based on users requests.
 * @param assistant the assistant that will handle the request
 * @returns an array of available functions that can be used.
 */
const appTools = (assistant: AIAssistant): Promise<
  AssistantCreateParams.AssistantToolsFunction[]
> => {
  return tools ??= Context.active().runtime!.then(async (runtime) => {
    const manifest = assistant.availableFunctions
      ? pickFunctions(assistant.availableFunctions, runtime.manifest)
      : runtime.manifest;
    const schemas = mschema ??
      await genSchemas(manifest, runtime.sourceMap);
    const functionKeys = assistant.availableFunctions ?? Object.keys({
      ...runtime.manifest.loaders,
      ...runtime.manifest.actions,
    });
    return functionKeys.map(
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
  });
};

export interface ProcessorOpts {
  assistantId: string;
  instructions: string;
}

const sleep = (ns: number) => new Promise((resolve) => setTimeout(resolve, ns));

const cache: Record<string, unknown> = {};

// const matchProductCategory = (products: any, queryCategory: string) => {
//   console.log("matchProductCategory", products[0]);
//   return products.every((product: any) =>
//     product.category.includes(queryCategory)
//   );
// };

const checkAndHandleResults = (products: Product[], queryCategory: string) => {
  if (products.length === 0) {
    return "I couldn't find any products matching your search. Could you specify what you're looking for a bit more?";
  }

  const isCategoryMatch = products.some((product: Product) =>
    product.category?.includes(queryCategory)
  );
  if (!isCategoryMatch) {
    return "It seems the products found don't exactly match your search. Could you specify what you're looking for a bit more?";
  }

  return null; // No issues with the results
};

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
      const response = checkAndHandleResults(
        invokeResponse as Product[],
        assistantProps.query,
      );
      return {
        tool_call_id: call.id,
        output: JSON.stringify(response),
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
  const aiAssistant = await ctx.assistant.then((assistant) => assistant.id);
  const tools = await appTools(assistant);

  /**
   * Processes an incoming chat message.
   * @param {ChatMessage} message - The incoming chat message.
   * @returns {Promise<void>} - A promise representing the completion of message processing.
   */
  return async ({ text: content, reply }: ChatMessage) => {
    // send message
    await threads.messages.create(thread.id, {
      content,
      role: "user",
    });
    // create run
    const run = await threads.runs.create(thread.id, {
      model: typeof assistant.model === "object"
        ? assistant.model.custom
        : assistant.model,
      assistant_id: aiAssistant,
      instructions: instructions.slice(0, 25000),
      tools,
    });

    const messageId = run.id;
    // Wait for the assistant answer
    const functionCallReplies: FunctionCallReply<unknown>[] = [];

    const invoke = invokeFor(ctx, assistant, (call, props) => {
      console.log({ props });
      reply({
        messageId,
        type: "start_function_call",
        content: {
          name: call.function.name,
          props,
        },
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

      console.log("status", runStatus.status);
      if (runStatus.status === "requires_action") {
        const actions = runStatus.required_action!;
        const outputs = actions.submit_tool_outputs;
        const tool_outputs = await Promise.all(
          outputs.tool_calls.map(invoke),
        );
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

      return;
    }

    const token = getToken(lastMsg);
    console.log({ token });
    const replyMessage = threadMessageToReply(lastMsg);

    const _latestMsg = lastMsg.id;
    reply(replyMessage);

    if (functionCallReplies.length > 0) {
      reply({
        messageId,
        type: "function_calls" as const,
        content: functionCallReplies,
      });
    }
  };
};

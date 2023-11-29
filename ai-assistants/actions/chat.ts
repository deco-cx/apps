import { mschema } from "deco/routes/live/_meta.ts";
import { AssistantCreateParams, MessageContentText } from "../deps.ts";
import { AppContext } from "../mod.ts";

import { context } from "deco/live.ts";

export interface AIAssistant {
  instructions: string;
  name: string;
}

function dereferenceJsonSchema(schema: any) {
  const resolveReference = (obj: any, visited: Record<string, boolean>) => {
    if (obj && typeof obj === "object") {
      if ("$ref" in obj) {
        if (visited[obj["$ref"]]) {
          return {};
        }
        visited[obj["$ref"]] = true;
        const [_, __, ref] = obj["$ref"].split("/");
        return resolveReference(schema["definitions"][ref], visited);
      } else {
        for (const key in obj) {
          obj[key] = resolveReference(obj[key], visited);
        }
      }
    }
    return obj;
  };

  return resolveReference(schema, {});
}
const notUndefined = <T>(v: T | undefined): v is T => v !== undefined;
let tools: Promise<AssistantCreateParams.AssistantToolsFunction[]> | null =
  null;
const getLoadersTools = (): Promise<
  AssistantCreateParams.AssistantToolsFunction[]
> => {
  if (!mschema) {
    return Promise.resolve([]);
  }
  return tools ??= context.runtime!.then((runtime) => {
    return Object.keys({...runtime.manifest.loaders, ...runtime.manifest.actions}).map(
      (loaderKey) => {
        if (!loaderKey.startsWith("vtex")) {
          return undefined;
        }
        if (
          [
            "deco-sites/storefront/loaders/List/Sections.tsx",
            "workflows/loaders/events.ts",
          ].includes(loaderKey)
        ) {
          return undefined;
        }
        const loaderDefinition = btoa(loaderKey);
        const schema = mschema!.definitions[loaderDefinition] as any;
        const propsRef = schema.allOf?.[0]?.$ref;
        if (!propsRef) {
          return undefined;
        }
        const dereferenced = dereferenceJsonSchema({
          $ref: propsRef,
          ...mschema,
        });
        if (
          dereferenced.type !== "object" ||
          (dereferenced.oneOf || dereferenced.anyOf ||
            dereferenced.allOf | dereferenced.enum | dereferenced.not)
        ) {
          return undefined;
        }
        return {
          type: "function" as const,
          function: {
            name: loaderKey,
            description: schema?.description,
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
export interface Props {
  thread?: string;
}
const sleep = (ns: number) => new Promise((resolve) => setTimeout(resolve, ns));
export default async function openChat(
  _props: Props,
  req: Request,
  ctx: AppContext,
) {
  try {
    const openAI = ctx.openAI;
    const thread = await openAI.beta.threads.create();
    const { socket, response } = Deno.upgradeWebSocket(req);
    socket.onmessage = async (event) => {
      await openAI.beta.threads.messages.create(thread.id, {
        content: event.data,
        role: "user",
      });
      const run = await openAI.beta.threads.runs.create(thread.id, {
        assistant_id: await ctx.assistant.then((assistant) => assistant.id),
        instructions: ctx.instructions,
        tools: await getLoadersTools(),
      });
      // Wait for the assistant answer
      let runStatus;
      do {
        runStatus = await openAI.beta.threads.runs.retrieve(
          thread.id,
          run.id,
        );
        if (runStatus.status === "requires_action") {
          const actions = runStatus.required_action!;
          if (actions.type === "submit_tool_outputs") {
            const outputs = actions.submit_tool_outputs;
            const tool_outputs = await Promise.all(
              outputs.tool_calls.map(async (call) => {
                console.log(call);
                const resp = await ctx.invoke(
                  `${call.function.name.replaceAll(".", "/")}.ts` as any,
                  JSON.parse(call.function.arguments),
                );
                console.log(JSON.stringify({call, resp}));
                  return {
                    tool_call_id: call.id,
                    output: JSON.stringify(resp),
                  };
              }),
            );
            await openAI.beta.threads.runs.submitToolOutputs(
              thread.id,
              run.id,
              {
                tool_outputs,
              },
            );
            runStatus = await openAI.beta.threads.runs.retrieve(
              thread.id,
              run.id,
            );
          }
        }
        await sleep(1000);
      } while (["in_progress", "queued"].includes(runStatus.status));

      const messages = await openAI.beta.threads.messages.list(thread.id);
      console.log(JSON.stringify({ messages }));
      const lastMessageForRun = messages.data
        .findLast((message) =>
          message.run_id == run.id && message.role === "assistant"
        );

      if (!lastMessageForRun) {
        return;
      }
      const txt =
        (lastMessageForRun.content[0] as MessageContentText).text.value;
      socket.send(txt);
    };
    return response;
  } catch (err) {
    console.log(err, "Errr");
    throw err;
  }
}

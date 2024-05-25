import { readFromStream } from "deco/utils/http.ts";
import { shortcircuit } from "deco/engine/errors.ts";
import { AppContext } from "../mod.ts";
import { JSONSchema7 } from "deco/deps.ts";
import { lazySchemaFor } from "deco/engine/schema/lazy.ts";
import { Context } from "deco/live.ts";
import { dereferenceJsonSchema } from "../../ai-assistants/schema.ts";
import { Anthropic } from "../deps.ts";

export interface Props {
  system?: string;
  model?: string;
  mode: string;
  messages: Anthropic.Beta.Tools.ToolsBetaMessageParam[];
  /**
   * Optional list of available functions (actions or loaders) that the AI Assistant can perform.
   */
  availableFunctions?: string[];
}

const notUndefined = <T>(v: T | undefined): v is T => v !== undefined;

const pathFormatter = {
  encode: (path: string): string => {
    return path.replace(/\.ts/g, "").replace(/\//g, "__");
  },
  decode: (encodedPath: string): string => {
    return encodedPath.replace(/__/g, "/") + ".ts";
  },
};

const appTools = (
  availableFunctions: string[],
): Promise<Anthropic.Beta.Tools.Tool[] | undefined> => {
  const ctx = Context.active();
  const toolsPromise = ctx.runtime!.then(async (runtime) => {
    const schemas = await lazySchemaFor(ctx).value;
    const functionKeys = availableFunctions ??
      Object.keys({
        ...runtime.manifest.loaders,
        ...runtime.manifest.actions,
      });

    const tools = functionKeys
      .map((functionKey) => {
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
          dereferenced.oneOf ||
          dereferenced.anyOf ||
          dereferenced?.allOf ||
          dereferenced?.enum ||
          dereferenced?.not
        ) {
          return undefined;
        }
        return {
          name: pathFormatter.encode(functionKey),
          description:
            `Usage for: ${schema?.description}. Example: ${schema?.examples}`,
          input_schema: {
            ...dereferenced,
            definitions: undefined,
            root: undefined,
            title: undefined,
          },
        };
      })
      .filter(notUndefined);
    return tools;
  });
  return toolsPromise as Promise<Anthropic.Beta.Tools.Tool[] | undefined>;
};

export default async function chat(
  { system, messages, availableFunctions }: Props,
  _req: Request,
  ctx: AppContext,
) {
  if (!messages) {
    return shortcircuit(new Response("No messages provided", { status: 400 }));
  }
  const tools = await appTools(availableFunctions ?? []);

  const headers = {
    "anthropic-version": "2023-06-01",
    "anthropic-beta": "tools-2024-05-16",
    "content-type": "application/json",
    "x-api-key": ctx.token ?? "",
  };

  const payload: Anthropic.Beta.Tools.MessageCreateParamsStreaming = {
    system,
    messages,
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    temperature: 0,
    stream: true,
    tools,
    tool_choice: { type: "auto" },
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    return readFromStream(response);
  } catch (e) {
    console.error(e);
    shortcircuit(new Response("Failed to process message", { status: 500 }));
  }
}

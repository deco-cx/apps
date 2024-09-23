import { Context, type JSONSchema7, lazySchemaFor } from "@deco/deco";

import { dereferenceJsonSchema } from "../ai-assistants/schema.ts";
import { Anthropic } from "./deps.ts";

const notUndefined = <T>(v: T | undefined): v is T => v !== undefined;

/**
 * Utility object for encoding and decoding file paths.
 */
const pathFormatter = {
  /**
   * Encodes a file path by removing ".ts" and replacing slashes with "__".
   * @param path - The file path to encode.
   * @returns The encoded file path.
   */
  encode: (path: string): string =>
    path.replace(/\.ts/g, "").replace(/\//g, "__"),

  /**
   * Decodes an encoded file path by replacing "__" with slashes and adding ".ts".
   * @param encodedPath - The encoded file path to decode.
   * @returns The decoded file path.
   */
  decode: (encodedPath: string): string =>
    encodedPath.replace(/__/g, "/") + ".ts",
};

/**
 * Retrieves the available tools for the AI Assistant.
 * @param availableFunctions List of functions available for the AI Assistant.
 * @returns Promise resolving to a list of tools.
 */
export const getAppTools = async (
  availableFunctions: string[],
): Promise<Anthropic.Tool[] | undefined> => {
  const ctx = Context.active();
  const runtime = await ctx.runtime!;
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
        dereferenced.allOf ||
        dereferenced.enum ||
        dereferenced.not
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

  return tools as Anthropic.Tool[] | undefined;
};

import { JSONSchema7 } from "deco/deps.ts";

const isJSONSchema = (
  v: unknown | JSONSchema7,
): v is JSONSchema7 & {
  $ref: string;
} => {
  return (typeof v === "object" && ((v as JSONSchema7)?.$ref !== undefined));
};

export function dereferenceJsonSchema(
  schema: JSONSchema7 & { definitions?: Record<string, JSONSchema7> },
) {
  const resolveReference = (
    obj: unknown,
    visited: Record<string, boolean>,
  ): JSONSchema7 => {
    if (isJSONSchema(obj)) {
      if (visited[obj["$ref"]]) {
        return {};
      }
      visited[obj["$ref"]] = true;
      const [_, __, ref] = obj["$ref"].split("/");
      return resolveReference(schema?.definitions?.[ref], visited);
    } else if (obj && typeof obj === "object") {
      const recordObj = obj as Record<string, JSONSchema7>;
      for (const key in recordObj) {
        recordObj[key] = resolveReference(recordObj[key], visited);
      }
    }
    return obj as JSONSchema7;
  };

  return resolveReference(schema, {});
}

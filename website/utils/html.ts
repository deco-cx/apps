export const stripHTML = (str: string) =>
  str.replace(
    /(<([^>]+)>)/gi,
    "",
  );

export function safeJsonSerialize(
  // deno-lint-ignore no-explicit-any
  obj: any,
  options?: { returnAsString?: boolean },
) {
  if (!obj) {
    return options?.returnAsString ? "{}" : {};
  }

  if (typeof obj !== "object") {
    return options?.returnAsString ? String(obj) : obj;
  }

  const json = stripHTML(JSON.stringify(obj));

  if (options?.returnAsString) {
    return json;
  }

  return JSON.parse(json);
}

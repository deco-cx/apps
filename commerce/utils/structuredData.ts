// commerce/utils/structuredData.ts
export type StructuredDataControl =
  | "disable for users"
  | "disable for all"
  | "always include";

export function shouldIncludeStructuredData(
  jsonLD: unknown,
  control: StructuredDataControl = "always include",
  isBot: boolean,
): boolean {
  if (!jsonLD) return false;

  return control !== "disable for all" &&
    (control !== "disable for users" || isBot);
}

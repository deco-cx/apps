/**
 * @description Safely parses a value to a JSON object. It doesn't validates the object, it just tries to parse it.
 * @param value - The value to parse
 * @returns The parsed value or null if the value is not a string
 */
export default function safeParse<T>(value: string): T | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch (_e) {
    return null;
  }
}

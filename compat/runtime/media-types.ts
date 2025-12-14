// compat/runtime/media-types.ts
// Media type parsing - replacement for std/media_types/parse_media_type.ts

export function parseMediaType(
  contentType: string,
): [string, Record<string, string>] {
  const [mediaType, ...paramParts] = contentType.split(";").map((s) => s.trim());

  const params: Record<string, string> = {};
  for (const part of paramParts) {
    const [key, value] = part.split("=").map((s) => s.trim());
    if (key && value) {
      // Remove quotes if present
      params[key] = value.replace(/^["']|["']$/g, "");
    }
  }

  return [mediaType.toLowerCase(), params];
}


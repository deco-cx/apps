/**
 * Converts a base64 string to a File object
 */
export async function base64ToFile(
  base64: string,
  filename: string,
  contentType?: string,
): Promise<File> {
  const type = contentType ?? "application/octet-stream";
  const response = await fetch(`data:${type};base64,${base64}`);
  const blob = await response.blob();
  return new File([blob], filename, { type });
}

/**
 * Converts an ArrayBuffer to a base64 string
 */
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

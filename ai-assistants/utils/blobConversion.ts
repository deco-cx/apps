import { logger } from "deco/observability/otel/config.ts";
import { AssistantIds } from "../types.ts";

export default function base64ToBlob(
  base64: string | ArrayBuffer | null,
  context: string,
  assistantIds?: AssistantIds,
): Blob {
  let regex =
    /^data:(audio\/[a-z0-9\-\+\.]+|video\/[a-z0-9\-\+\.]+);base64,(.*)$/;
  if (context === "image") {
    regex = /^data:(image\/[a-z]+);base64,(.*)$/;
  }
  // Split the base64 string into the MIME type and the base64 encoded data
  if (!base64 || typeof base64 !== "string") {
    logger.error(`${
      JSON.stringify({
        assistantId: assistantIds?.assistantId,
        threadId: assistantIds?.threadId,
        context: context,
        error: "Expected a base64 string, typeof base64 is not string",
      })
    }`);
    throw new Error("Expected a base64 string");
  }

  const parts = base64.match(regex);
  if (!parts || parts.length !== 3) {
    logger.error(`${
      JSON.stringify({
        assistantId: assistantIds?.assistantId,
        threadId: assistantIds?.threadId,
        context: context,
        error: `${context} Base64 string is not properly formatted: ${base64}`,
      })
    }`);
    throw new Error(
      `${context} Base64 string is not properly formatted: ${parts}`,
    );
  }

  const mimeType = parts[1]; // e.g., 'audio/png' or 'video/mp4' or 'audio/mp3' or 'image/png'
  const mediaData = parts[2];

  // Convert the base64 encoded data to a binary string
  const binaryStr = atob(mediaData);

  // Convert the binary string to an array of bytes (Uint8Array)
  const length = binaryStr.length;
  const arrayBuffer = new Uint8Array(new ArrayBuffer(length));

  for (let i = 0; i < length; i++) {
    arrayBuffer[i] = binaryStr.charCodeAt(i);
  }

  // Create and return the Blob object
  return new Blob([arrayBuffer], { type: mimeType });
}

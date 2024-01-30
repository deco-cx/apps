import { logger } from "deco/observability/otel/config.ts";
import { Ids } from "../types.ts";

// TODO(ItamarRocha): pass the ids here as well
export default function base64ToBlob(
  base64: string | ArrayBuffer | null,
  context: string,
  ids?: Ids,
): Blob {
  let regex =
    /^data:(audio\/[a-z]+|video\/[a-z]+|audio\/mp[34]|video\/mp4);base64,(.*)$/;
  if (context === "image") {
    regex = /^data:(image\/[a-z]+);base64,(.*)$/;
  }
  console.log(regex);
  // Split the base64 string into the MIME type and the base64 encoded data
  if (!base64 || typeof base64 !== "string") {
    logger.error(`${
      JSON.stringify({
        assistantId: ids?.assistantId,
        threadId: ids?.threadId,
        context: context,
        error: "Expected a base64 string, typeof base64 is not string",
      })
    }`);
    throw new Error("Expected a base64 string");
  }

  const parts = base64.match(regex);
  // console.log(base64);
  console.log(parts);
  if (!parts || parts.length !== 3) {
    logger.error(`${
      JSON.stringify({
        assistantId: ids?.assistantId,
        threadId: ids?.threadId,
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

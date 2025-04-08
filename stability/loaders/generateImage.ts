import { AppContext } from "../mod.ts";
import { Buffer } from "node:buffer";
import { ASPECT_RATIOS, STYLE_PRESETS } from "../stabilityAiClient.ts";

/**
 * @name GENERATE_IMAGE
 * @description Generates an image from a text prompt using the Stability API. A presigned URL to upload the image to is required.
 */
export interface Props {
  /**
   * @description The presigned URL to upload the image to after generation. Probably can be created with a tool like CREATE_PRESIGNED_URL.
   */
  presignedUrl: string;
  /**
   * @description The text prompt to generate the image from
   */
  prompt: string;
  /**
   * @description The negative prompt to avoid certain elements in the image
   */
  negativePrompt?: string;
  /**
   * @description The aspect ratio of the generated image
   * @default "1:1"
   */
  aspectRatio?: typeof ASPECT_RATIOS[number];
  /**
   * @description The style preset to use for generation
   */
  stylePreset?: typeof STYLE_PRESETS[number];
  /**
   * @description The seed for deterministic generation
   */
  seed?: number;
}

export default async function generateImage(
  {
    presignedUrl,
    prompt,
    negativePrompt,
    aspectRatio = "1:1",
    stylePreset,
    seed,
  }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const { stabilityClient } = ctx;

  try {
    const result = await stabilityClient.generateImageCore(prompt, {
      aspectRatio,
      negativePrompt,
      stylePreset,
      seed,
    });

    const url = await uploadImage(result.base64Image, presignedUrl);

    return {
      content: [
        {
          type: "text",
          text: `Uploaded image to ${url}`,
        },
      ],
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function uploadImage(image: string, presignedUrl: string) {
  console.log("Starting image upload...");
  console.log("Presigned URL:", presignedUrl);
  console.log("Image length:", image.length);

  const imageBuffer = new Uint8Array(Buffer.from(image, "base64"));
  console.log("Image buffer length:", imageBuffer.length);

  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: imageBuffer,
  });

  console.log("Upload response status:", response.status);
  console.log(
    "Upload response headers:",
    Object.fromEntries(response.headers.entries()),
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Upload failed with response:", errorText);
    throw new Error(`Failed to upload image: ${response.status} ${errorText}`);
  }

  try {
    const data = await response.json();
    console.log("Upload response data:", data);
    return data.url;
  } catch (error) {
    console.error("Failed to parse upload response:", error);
    throw new Error("Failed to parse upload response");
  }
}

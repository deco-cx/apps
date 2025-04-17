import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import { ASPECT_RATIOS, ControlStyleOptions } from "../stabilityAiClient.ts";

/**
 * @name CONTROL_STYLE
 * @description Generate a new image in the style of a reference image
 */
export interface Props {
  /**
   * @description The URL of the style reference image
   */
  imageUrl: string;
  /**
   * @description The presigned URL to upload the modified image to. Probably can be created with a tool like CREATE_PRESIGNED_URL.
   */
  presignedUrl: string;
  /**
   * @description What you wish to see in the output image
   */
  prompt: string;
  /**
   * @description Optional description of what you don't want to see
   */
  negativePrompt?: string;
  /**
   * @description Optional aspect ratio for the generated image
   */
  aspectRatio?: typeof ASPECT_RATIOS[number];
  /**
   * @description How closely the output image's style should match the input (0-1)
   */
  fidelity?: number;
}

async function handleControlStyle(
  imageBuffer: Uint8Array,
  options: ControlStyleOptions,
  presignedUrl: string,
  ctx: AppContext,
) {
  try {
    const { stabilityClient } = ctx;
    const result = await stabilityClient.controlStyle(imageBuffer, options);

    await uploadImage(result.base64Image, presignedUrl);
  } catch (error) {
    console.error("Error in control style:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
  }
}

export default async function controlStyle(
  { imageUrl, presignedUrl, prompt, negativePrompt, aspectRatio, fidelity }:
    Props,
  _request: Request,
  ctx: AppContext,
) {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = new Uint8Array(imageArrayBuffer);

    handleControlStyle(
      imageBuffer,
      { prompt, negativePrompt, aspectRatio, fidelity },
      presignedUrl,
      ctx,
    );

    const finalUrl = presignedUrl.replaceAll("_presigned/", "");
    return {
      content: [
        {
          type: "text",
          text:
            `Started control style process with prompt "${prompt}". The result will be available at ${finalUrl} when complete.`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `Error: Failed to start control style process: ${errorMessage}`,
        },
      ],
    };
  }
}

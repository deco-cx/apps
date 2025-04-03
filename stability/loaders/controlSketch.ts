import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import { ControlSketchOptions } from "../stabilityAiClient.ts";

/**
 * @name CONTROL_SKETCH
 * @description Translate hand-drawn sketches to production-grade images.
 */
export interface Props {
  /**
   * @description The URL of the image to modify
   */
  imageUrl: string;
  /**
   * @description The presigned URL to upload the modified image to. Probably can be created with a tool like CREATE_PRESIGNED_URL.
   */
  presignedUrl: string;
  /**
   * @description What you wish to see in the output image. A strong, descriptive prompt that clearly defines elements, colors, and subjects.
   */
  prompt: string;
  /**
   * @description How much influence, or control, the image has on the generation. Represented as a float between 0 and 1, where 0 is the least influence and 1 is the maximum.
   */
  controlStrength?: number;
  /**
   * @description What you do not wish to see in the output image.
   */
  negativePrompt?: string;
}

async function handleControlSketch(
  imageBuffer: Uint8Array,
  options: ControlSketchOptions,
  presignedUrl: string,
  ctx: AppContext,
) {
  try {
    const { stabilityClient } = ctx;
    const result = await stabilityClient.controlSketch(imageBuffer, options);
    await uploadImage(result.base64Image, presignedUrl);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
  }
}

export default async function controlSketch(
  { imageUrl, presignedUrl, prompt, controlStrength, negativePrompt }: Props,
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

    handleControlSketch(
      imageBuffer,
      { prompt, controlStrength, negativePrompt },
      presignedUrl,
      ctx,
    );

    const finalUrl = presignedUrl.replaceAll("_presigned/", "");
    return {
      content: [
        {
          type: "text",
          text:
            `Started control sketch process with prompt "${prompt}". The result will be available at ${finalUrl} when complete.`,
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
          text:
            `Error: Failed to start control sketch process: ${errorMessage}`,
        },
      ],
    };
  }
}

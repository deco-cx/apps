import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import { ControlStructureOptions } from "../stabilityAiClient.ts";

/**
 * @name CONTROL_STRUCTURE
 * @description Generate a new image while maintaining the structure of a reference image
 */
export interface Props {
  /**
   * @description The URL of the structure reference image
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
   * @description How much influence the reference image has on the generation (0-1)
   */
  controlStrength?: number;
  /**
   * @description Optional description of what you don't want to see
   */
  negativePrompt?: string;
}

async function handleControlStructure(
  imageBuffer: Uint8Array,
  options: ControlStructureOptions,
  presignedUrl: string,
  ctx: AppContext,
) {
  try {
    const { stabilityClient } = ctx;
    const result = await stabilityClient.controlStructure(imageBuffer, options);

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

export default async function controlStructure(
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

    handleControlStructure(
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
            `Started control structure process with prompt "${prompt}". The result will be available at ${finalUrl} when complete.`,
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
            `Error: Failed to start control structure process: ${errorMessage}`,
        },
      ],
    };
  }
}

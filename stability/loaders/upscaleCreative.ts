import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import { UpscaleCreativeOptions } from "../stabilityAiClient.ts";

/**
 * @name UPSCALE_CREATIVE
 * @description Enhance image resolution up to 4K using AI with creative interpretation. This tool works best on highly degraded images and performs heavy reimagining.
 */
export interface Props {
  /**
   * @description The URL of the image to upscale
   */
  imageUrl: string;
  /**
   * @description The presigned URL to upload the upscaled image to. Probably can be created with a tool like CREATE_PRESIGNED_URL.
   */
  presignedUrl: string;
  /**
   * @description What you wish to see in the output image. A strong, descriptive prompt that clearly defines elements, colors, and subjects.
   */
  prompt: string;
  /**
   * @description Optional text describing what you do not wish to see in the output image.
   */
  negativePrompt?: string;
  /**
   * @description Optional value (0-0.35) indicating how creative the model should be. Higher values add more details during upscaling.
   */
  creativity?: number;
}

async function handleUpscaleCreative(
  imageBuffer: Uint8Array,
  options: UpscaleCreativeOptions,
  presignedUrl: string,
  ctx: AppContext,
) {
  try {
    const { stabilityClient } = ctx;
    const result = await stabilityClient.upscaleCreative(imageBuffer, options);

    const finalResult = await stabilityClient.fetchGenerationResult(result.id);

    await uploadImage(finalResult.base64Image, presignedUrl);
  } catch (error) {
    console.error("Error in background upscaling:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
  }
}

export default async function upscaleCreative(
  { imageUrl, presignedUrl, prompt, negativePrompt, creativity }: Props,
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

    handleUpscaleCreative(
      imageBuffer,
      { prompt, negativePrompt, creativity },
      presignedUrl,
      ctx,
    );

    const finalUrl = presignedUrl.replaceAll("_presigned/", "");
    return {
      content: [
        {
          type: "text",
          text:
            `Started creative upscaling process. The result will be available at ${finalUrl} when complete.`,
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
          text: `Error: Failed to start upscaling process: ${errorMessage}`,
        },
      ],
    };
  }
}

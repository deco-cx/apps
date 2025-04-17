import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import {
  fetchAndProcessImage,
  processImageWithCompression,
} from "../utils/imageProcessing.ts";

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

export default async function upscaleCreative(
  { imageUrl, presignedUrl, prompt, negativePrompt, creativity }: Props,
  _request: Request,
  ctx: AppContext,
) {
  try {
    const imageBuffer = await fetchAndProcessImage(imageUrl);
    const { stabilityClient } = ctx;

    await processImageWithCompression({
      imageBuffer,
      processFn: async (buffer) => {
        const result = await stabilityClient.upscaleCreative(buffer, {
          prompt,
          negativePrompt,
          creativity,
        });

        if (result.id) {
          stabilityClient.fetchGenerationResult(result.id)
            .then((finalResult) =>
              uploadImage(finalResult.base64Image, presignedUrl)
            )
            .catch((error) => console.error("Error processing image:", error));
        }

        return result as unknown as Uint8Array;
      },
    });

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

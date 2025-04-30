import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import {
  compressImage,
  fetchAndProcessImage,
  processImageWithCompression,
} from "../utils/imageProcessing.ts";

/**
 * @name REPLACE_BACKGROUND_AND_RELIGHT
 * @description Replace the background of an image and adjust its lighting. Either backgroundPrompt or backgroundReferenceUrl is required.
 */
export interface Props {
  /**
   * @description The URL of the subject image to modify
   */
  imageUrl: string;
  /**
   * @description The presigned URL to upload the modified image to. Probably can be created with a tool like CREATE_PRESIGNED_URL.
   */
  presignedUrl: string;
  /**
   * @description Description of the desired background. If not provided, must use backgroundReferenceUrl.
   */
  backgroundPrompt?: string;
  /**
   * @description Optional URL to a reference image for background style. If not provided, must use backgroundPrompt.
   */
  backgroundReferenceUrl?: string;
  /**
   * @description Optional description of the subject to prevent background bleeding
   */
  foregroundPrompt?: string;
  /**
   * @description Optional description of what you don't want to see
   */
  negativePrompt?: string;
  /**
   * @description How much to preserve the original subject (0-1)
   */
  preserveOriginalSubject?: number;
  /**
   * @description Control background depth matching (0-1)
   */
  originalBackgroundDepth?: number;
  /**
   * @description Whether to keep the original background
   */
  keepOriginalBackground?: boolean;
  /**
   * @description Direction of the light source. Can be "above", "below", "left", or "right"
   */
  lightSourceDirection?: "above" | "below" | "left" | "right";
  /**
   * @description Optional URL to a reference image for lighting
   */
  lightReferenceUrl?: string;
  /**
   * @description Strength of the light source (0-1)
   */
  lightSourceStrength?: number;
}

export default async function replaceBackgroundAndRelight(
  {
    imageUrl,
    presignedUrl,
    backgroundPrompt,
    backgroundReferenceUrl,
    foregroundPrompt,
    negativePrompt,
    preserveOriginalSubject,
    originalBackgroundDepth,
    keepOriginalBackground,
    lightSourceDirection,
    lightReferenceUrl,
    lightSourceStrength,
  }: Props,
  _request: Request,
  ctx: AppContext,
) {
  if (!backgroundPrompt && !backgroundReferenceUrl) {
    return {
      content: [
        {
          type: "text",
          text: "Error: backgroundPrompt or backgroundReferenceUrl is required",
        },
      ],
    };
  }

  try {
    const imageBuffer = await fetchAndProcessImage(imageUrl);
    const { stabilityClient } = ctx;

    let backgroundReferenceBuffer: Uint8Array | undefined;
    if (backgroundReferenceUrl) {
      backgroundReferenceBuffer = await fetchAndProcessImage(
        backgroundReferenceUrl,
      );
    }

    let lightReferenceBuffer: Uint8Array | undefined;
    if (lightReferenceUrl) {
      lightReferenceBuffer = await fetchAndProcessImage(lightReferenceUrl);
    }

    await processImageWithCompression({
      imageBuffer,
      processFn: async (buffer) => {
        const result = await stabilityClient.replaceBackgroundAndRelight(
          buffer,
          {
            backgroundPrompt,
            foregroundPrompt,
            negativePrompt,
            preserveOriginalSubject,
            originalBackgroundDepth,
            keepOriginalBackground,
            lightSourceDirection,
            lightSourceStrength,
            backgroundReference: backgroundReferenceBuffer
              ? String(await compressImage(backgroundReferenceBuffer))
              : undefined,
            lightReference: lightReferenceBuffer
              ? String(await compressImage(lightReferenceBuffer))
              : undefined,
          },
        );

        if (result.id) {
          // Start the async processing without awaiting
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
            `Started background replacement and relighting process. The result will be available at ${finalUrl} when complete.`,
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
            `Error: Failed to start background replacement process: ${errorMessage}`,
        },
      ],
    };
  }
}

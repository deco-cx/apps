import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import { ReplaceBackgroundAndRelightOptions } from "../stabilityAiClient.ts";

/**
 * @name REPLACE_BACKGROUND_AND_RELIGHT
 * @description Replace the background of an image and adjust its lighting.
 */
export interface Props {
  /**
   * @description The URL of the subject image to modify
   */
  imageUrl: string;
  /**
   * @description The presigned URL to upload the modified image to
   */
  presignedUrl: string;
  /**
   * @description Description of the desired background
   */
  backgroundPrompt?: string;
  /**
   * @description Optional URL to a reference image for background style
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
   * @description Direction of the light source
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

async function handleReplaceBackgroundAndRelight(
  imageBuffer: Uint8Array,
  backgroundReferenceBuffer: Uint8Array | undefined,
  lightReferenceBuffer: Uint8Array | undefined,
  options: ReplaceBackgroundAndRelightOptions,
  presignedUrl: string,
  ctx: AppContext,
) {
  try {
    console.log("Starting background replacement and relighting process...");
    console.log("Options:", options);
    console.log("Image buffer length:", imageBuffer.length);

    const { stabilityClient } = ctx;
    console.log("Initiating background replacement request...");
    const result = await stabilityClient.replaceBackgroundAndRelight(
      imageBuffer,
      {
        ...options,
        backgroundReference: backgroundReferenceBuffer
          ? new TextDecoder().decode(backgroundReferenceBuffer)
          : undefined,
        lightReference: lightReferenceBuffer
          ? new TextDecoder().decode(lightReferenceBuffer)
          : undefined,
      },
    );
    console.log("Background replacement initiated, generation ID:", result.id);

    console.log("Starting to poll for results...");
    const finalResult = await stabilityClient.fetchGenerationResult(result.id);
    console.log(
      "Received final result, image length:",
      finalResult.base64Image.length,
    );

    console.log("Starting image upload...");
    await uploadImage(finalResult.base64Image, presignedUrl);
    console.log("Image upload completed successfully");
  } catch (error) {
    console.error("Error in background replacement:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
  }
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
  try {
    // Fetch the subject image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch subject image: ${imageResponse.statusText}`,
      );
    }
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = new Uint8Array(imageArrayBuffer);

    // Fetch background reference image if provided
    let backgroundReferenceBuffer: Uint8Array | undefined;
    if (backgroundReferenceUrl) {
      const backgroundResponse = await fetch(backgroundReferenceUrl);
      if (!backgroundResponse.ok) {
        throw new Error(
          `Failed to fetch background reference: ${backgroundResponse.statusText}`,
        );
      }
      const backgroundArrayBuffer = await backgroundResponse.arrayBuffer();
      backgroundReferenceBuffer = new Uint8Array(backgroundArrayBuffer);
    }

    // Fetch light reference image if provided
    let lightReferenceBuffer: Uint8Array | undefined;
    if (lightReferenceUrl) {
      const lightResponse = await fetch(lightReferenceUrl);
      if (!lightResponse.ok) {
        throw new Error(
          `Failed to fetch light reference: ${lightResponse.statusText}`,
        );
      }
      const lightArrayBuffer = await lightResponse.arrayBuffer();
      lightReferenceBuffer = new Uint8Array(lightArrayBuffer);
    }

    // Start the background replacement process in the background
    handleReplaceBackgroundAndRelight(
      imageBuffer,
      backgroundReferenceBuffer,
      lightReferenceBuffer,
      {
        backgroundPrompt,
        foregroundPrompt,
        negativePrompt,
        preserveOriginalSubject,
        originalBackgroundDepth,
        keepOriginalBackground,
        lightSourceDirection,
        lightSourceStrength,
      },
      presignedUrl,
      ctx,
    );

    // Return the final URL immediately
    const finalUrl = presignedUrl.replaceAll("_presigned_url", "");
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

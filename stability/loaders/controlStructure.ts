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
   * @description The presigned URL to upload the modified image to
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
    console.log("Starting control structure process...");
    console.log("Options:", options);
    console.log("Image buffer length:", imageBuffer.length);

    const { stabilityClient } = ctx;
    console.log("Initiating control structure request...");
    const result = await stabilityClient.controlStructure(imageBuffer, options);
    console.log(
      "Control structure completed, image length:",
      result.base64Image.length,
    );

    console.log("Starting image upload...");
    await uploadImage(result.base64Image, presignedUrl);
    console.log("Image upload completed successfully");
  } catch (error) {
    console.error("Error in control structure:", error);
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
    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = new Uint8Array(imageArrayBuffer);

    // Start the control structure process in the background
    handleControlStructure(
      imageBuffer,
      { prompt, controlStrength, negativePrompt },
      presignedUrl,
      ctx,
    );

    // Return the final URL immediately
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

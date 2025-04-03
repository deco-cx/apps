import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import { OutpaintOptions } from "../stabilityAiClient.ts";

/**
 * @name OUTPAINT
 * @description Extends an image in any direction while maintaining visual consistency.
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
   * @description The number of pixels to extend the image to the left
   */
  left?: number;
  /**
   * @description The number of pixels to extend the image to the right
   */
  right?: number;
  /**
   * @description The number of pixels to extend the image upwards
   */
  up?: number;
  /**
   * @description The number of pixels to extend the image downwards
   */
  down?: number;
  /**
   * @description The creativity of the outpaint operation (0-1)
   */
  creativity?: number;
  /**
   * @description The prompt to use for the outpaint operation
   */
  prompt?: string;
}

async function handleOutpaint(
  imageBuffer: Uint8Array,
  options: OutpaintOptions,
  presignedUrl: string,
  ctx: AppContext,
) {
  try {
    console.log("Starting outpaint process...");
    console.log("Options:", options);
    console.log("Image buffer length:", imageBuffer.length);

    const { stabilityClient } = ctx;
    console.log("Initiating outpaint request...");
    const result = await stabilityClient.outpaint(imageBuffer, options);
    console.log("Outpaint completed, image length:", result.base64Image.length);

    console.log("Starting image upload...");
    await uploadImage(result.base64Image, presignedUrl);
    console.log("Image upload completed successfully");
  } catch (error) {
    console.error("Error in outpaint:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
  }
}

export default async function outpaint(
  { imageUrl, presignedUrl, left, right, up, down, creativity, prompt }: Props,
  _request: Request,
  ctx: AppContext,
) {
  try {
    // Ensure at least one direction is specified
    if (!left && !right && !up && !down) {
      throw new Error(
        "At least one direction (left, right, up, or down) must be specified",
      );
    }

    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = new Uint8Array(imageArrayBuffer);

    // Start the outpaint process in the background
    handleOutpaint(
      imageBuffer,
      { left, right, up, down, creativity, prompt },
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
            `Started outpaint process. The result will be available at ${finalUrl} when complete.`,
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
          text: `Error: Failed to start outpaint process: ${errorMessage}`,
        },
      ],
    };
  }
}

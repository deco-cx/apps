import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";

/**
 * @name REMOVE_BACKGROUND
 * @description Remove the background from an image.
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
}

async function handleRemoveBackground(
  imageBuffer: Uint8Array,
  presignedUrl: string,
  ctx: AppContext,
) {
  try {
    console.log("Starting background removal process...");
    console.log("Image buffer length:", imageBuffer.length);

    const { stabilityClient } = ctx;
    console.log("Initiating background removal request...");
    const result = await stabilityClient.removeBackground(imageBuffer);
    console.log(
      "Background removal completed, image length:",
      result.base64Image.length,
    );

    console.log("Starting image upload...");
    await uploadImage(result.base64Image, presignedUrl);
    console.log("Image upload completed successfully");
  } catch (error) {
    console.error("Error in background removal:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
  }
}

export default async function removeBackground(
  { imageUrl, presignedUrl }: Props,
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

    // Start the background removal process in the background
    handleRemoveBackground(imageBuffer, presignedUrl, ctx);

    // Return the final URL immediately
    const finalUrl = presignedUrl.replaceAll("_presigned/", "");
    return {
      content: [
        {
          type: "text",
          text:
            `Started background removal process. The result will be available at ${finalUrl} when complete.`,
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
            `Error: Failed to start background removal process: ${errorMessage}`,
        },
      ],
    };
  }
}

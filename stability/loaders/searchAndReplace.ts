import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import {
  fetchAndProcessImage,
  processImageWithCompression,
} from "../utils/imageProcessing.ts";

/**
 * @name SEARCH_AND_REPLACE
 * @description Replace objects or elements in an image by describing what to replace and what to replace it with.
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
   * @description Short description of what to replace in the image
   */
  searchPrompt: string;
  /**
   * @description What you wish to see in place of the searched content
   */
  prompt: string;
}

export default async function searchAndReplace(
  { imageUrl, presignedUrl, searchPrompt, prompt }: Props,
  _request: Request,
  ctx: AppContext,
) {
  try {
    const imageBuffer = await fetchAndProcessImage(imageUrl);
    const { stabilityClient } = ctx;

    await processImageWithCompression({
      imageBuffer,
      processFn: async (buffer) => {
        const result = await stabilityClient.searchAndReplace(buffer, {
          searchPrompt,
          prompt,
        });

        // Start the async upload without awaiting
        uploadImage(result.base64Image, presignedUrl)
          .catch((error) => console.error("Error uploading image:", error));

        return result as unknown as Uint8Array;
      },
    });

    const finalUrl = presignedUrl.replaceAll("_presigned/", "");
    return {
      content: [
        {
          type: "text",
          text:
            `Started replacing "${searchPrompt}" with "${prompt}" in the image. The result will be available at ${finalUrl} when complete.`,
        },
      ],
    };
  } catch (error) {
    console.error("Error in search and replace:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
}

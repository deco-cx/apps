import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import { SearchAndRecolorOptions } from "../stabilityAiClient.ts";

/**
 * @name SEARCH_AND_RECOLOR
 * @description Search and recolor object(s) in an image by describing what to recolor and what colors to use.
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
   * @description Short description of what to search for and recolor in the image
   */
  selectPrompt: string;
  /**
   * @description What colors you wish to see in the output image
   */
  prompt: string;
  /**
   * @description Optional value to grow the mask around the selected area
   */
  growMask?: number;
}

async function handleSearchAndRecolor(
  imageBuffer: Uint8Array,
  options: SearchAndRecolorOptions,
  presignedUrl: string,
  ctx: AppContext,
) {
  try {
    const { stabilityClient } = ctx;
    const result = await stabilityClient.searchAndRecolor(imageBuffer, options);

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

export default async function searchAndRecolor(
  { imageUrl, presignedUrl, selectPrompt, prompt, growMask }: Props,
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

    handleSearchAndRecolor(
      imageBuffer,
      { selectPrompt, prompt, growMask },
      presignedUrl,
      ctx,
    );

    const finalUrl = presignedUrl.replaceAll("_presigned/", "");
    return {
      content: [
        {
          type: "text",
          text:
            `Started search and recolor process. The result will be available at ${finalUrl} when complete.`,
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
            `Error: Failed to start search and recolor process: ${errorMessage}`,
        },
      ],
    };
  }
}

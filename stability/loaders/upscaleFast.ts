import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";

/**
 * @name UPSCALE_FAST
 * @description Cheap and fast tool to enhance image resolution by 4x.
 */
export interface Props {
  /**
   * @description The URL of the image to upscale
   */
  imageUrl: string;
  /**
   * @description The presigned URL to upload the upscaled image to
   */
  presignedUrl: string;
}

export default async function upscaleFast(
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

    // Use the Stability AI client to upscale the image
    const { stabilityClient } = ctx;
    const result = await stabilityClient.upscaleFast(imageBuffer);

    // Upload the upscaled image
    const url = await uploadImage(result.base64Image, presignedUrl);

    return {
      content: [
        {
          type: "text",
          text: `Successfully upscaled image and uploaded to ${url}`,
        },
        {
          type: "text",
          text:
            `If you need even higher quality, you can use the upscale-creative model which provides better results but takes longer to process.`,
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
          text: `Error: Failed to upscale image: ${errorMessage}`,
        },
      ],
    };
  }
}

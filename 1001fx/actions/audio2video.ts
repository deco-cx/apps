import { AppContext } from "../mod.ts";
import { isValidUrl, validateImages } from "../utils.ts";
import { ImageConfig, VideoResolution } from "../client.ts";
import { Buffer } from "node:buffer";

export interface Props {
  /**
   * @description The URL of the audio file (MP3).
   * @example https://api.1001fx.com/testdata/jingle.mp3
   */
  url: string;

  /**
   * @description Array of images to show in your video. The length of your video will be the sum of your image durations.
   * It is recommended that all your images have the same aspect ratio.
   * @minItems 1
   * @maxItems 10
   */
  images: ImageConfig[];

  /**
   * @description The URL of the thumbnail image (optional).
   * @example https://api.1001fx.com/testdata/image.jpg
   */
  thumbnailImageUrl?: string;

  /**
   * @description The resolution of the output video (optional).
   * @default { "width": 1280, "height": 720 }
   */
  videoResolution?: VideoResolution;

  /**
   * @description The presigned URLs to upload the result to. When provided, the video URL will be
   * uploaded to this URL rather than returned directly. This allows for easier integration with storage systems.
   */
  presignedUrl: string;
}

interface AudioVideoResponse {
  url: string;
  statusCode: number;
}

/**
 * @title Convert MP3 to MP4 with Images
 * @description Converts an MP3 audio file into an MP4 video file with images displayed for specified durations.
 * The service adds images to the audio and creates a video file. The result is a URL to the MP4 file that is
 * available for 48 hours.
 */
export default async function audio2videoAction(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AudioVideoResponse> {
  const { url, images, thumbnailImageUrl, videoResolution, presignedUrl } =
    props;

  // Validate inputs
  if (!isValidUrl(url)) {
    throw new Error("Invalid audio URL provided");
  }

  if (images && !validateImages(images)) {
    throw new Error(
      "Invalid images array: must contain 1-10 valid image objects with URLs and durations",
    );
  }

  if (thumbnailImageUrl && !isValidUrl(thumbnailImageUrl)) {
    throw new Error("Invalid thumbnail image URL provided");
  }

  try {
    // Prepare request body
    const requestBody = {
      url,
      ...(images && { images }),
      ...(thumbnailImageUrl && { thumbnailImageUrl }),
      ...(videoResolution && { videoResolution }),
    };

    // Make API call to 1001fx
    const response = await ctx.api["POST /audiovideo/audio2video"](
      {},
      { body: requestBody },
    );

    const data = await response.json();

    // If presignedUrl is provided, upload the result
    if (presignedUrl && isValidUrl(presignedUrl)) {
      await uploadToPresignedUrl(data.result.url, presignedUrl);
      return {
        url: presignedUrl.split("?")[0].replace("_presigned/", ""), // Return clean URL without query params
        statusCode: 200,
      };
    }

    // Return the direct result from 1001fx
    return {
      url: response.url,
      statusCode: response.statusCode,
    };
  } catch (error) {
    console.error("Error in audio2video conversion:", error);

    // If we have a presignedUrl, try to write error message to it
    if (presignedUrl) {
      await writeErrorToPresignedUrl(
        presignedUrl,
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }

    throw error;
  }
}

/**
 * Uploads the video URL result to a presigned URL
 */
async function uploadToPresignedUrl(
  videoUrl: string,
  presignedUrl: string,
): Promise<void> {
  try {
    // Create a JSON response with the video URL
    const videoResponse = await fetch(videoUrl);
    const arrayBuffer = await videoResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to presigned URL
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to upload to presigned URL: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Error uploading to presigned URL:", error);
    throw error;
  }
}

/**
 * Writes an error message to the presigned URL
 */
async function writeErrorToPresignedUrl(
  presignedUrl: string,
  errorMessage: string,
): Promise<void> {
  try {
    const errorJson = JSON.stringify({
      error: errorMessage,
      statusCode: 5,
    });

    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: errorJson,
    });

    if (!response.ok) {
      console.error(
        `Failed to write error to presigned URL: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Error writing error to presigned URL:", error);
  }
}

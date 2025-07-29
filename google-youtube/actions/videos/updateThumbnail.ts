import type { UpdateThumbnailResponse } from "../../utils/types.ts";
import { AppContext } from "../../mod.ts";
import { COMMON_ERROR_MESSAGES } from "../../utils/constant.ts";

/**
 * @title Video ID
 * @description ID of the YouTube video
 */
export interface Props {
  /**
   * @title Video ID
   * @description ID of the YouTube video
   */
  videoId: string;

  /**
   * @title Image Data
   * @description URL of the image or base64 image data for the thumbnail
   */
  imageData?: string;

  /**
   * @title Image Base64
   * @description Base64 encoded image data for the thumbnail
   */
  imageBase64?: string;
}

export interface ThumbnailUpdateResult {
  success: boolean;
  thumbnail: UpdateThumbnailResponse;
}

export interface ThumbnailUpdateError {
  message: string;
  error: boolean;
  code?: number;
  details?: unknown;
}

export type ThumbnailResponse = ThumbnailUpdateResult | ThumbnailUpdateError;

/**
 * @name UPDATE_VIDEO_THUMBNAIL
 * @title Update YouTube Video Thumbnail
 * @description Updates the custom thumbnail for a YouTube video
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ThumbnailUpdateResult> {
  const { videoId, imageData, imageBase64 } = props;

  if (!videoId) {
    ctx.errorHandler.toHttpError(
      new Error(COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID),
      COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID,
    );
  }

  if (!imageData && !imageBase64) {
    ctx.errorHandler.toHttpError(
      new Error("Image data is required"),
      "Image data is required",
    );
  }

  try {
    let imageBlob: Blob;

    if (imageData && typeof imageData === "string") {
      const base64Data = imageData.split(",")[1] || imageData;
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }

      const byteArray = new Uint8Array(byteArrays);
      imageBlob = new Blob([byteArray], { type: "image/jpeg" });
    } else if (!imageBase64) {
      ctx.errorHandler.toHttpError(
        new Error("Invalid image format"),
        "Invalid image format",
      );
    }

    const updateResponse = await ctx.client["POST /thumbnails/set"](
      {
        videoId,
        uploadType: "media",
      },
      {
        headers: {
          "Content-Type": "image/jpeg, image/png, image/webp",
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
        },
        body: imageBase64 ? imageBase64 : imageBlob!,
      },
    );

    if (!updateResponse.ok) {
      ctx.errorHandler.toHttpError(
        updateResponse,
        `Failed to update thumbnail: ${updateResponse.statusText}`,
      );
    }

    const thumbnailData = await updateResponse.json();

    return {
      success: true,
      thumbnail: thumbnailData,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to process thumbnail update",
    );
  }
}

import type { AppContext } from "../../mod.ts";
import { LiveBroadcast } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Broadcast ID
   * @description ID of the live broadcast
   */
  broadcastId: string;

  /**
   * @title Thumbnail URL
   * @description URL of the image or base64 of the image for the thumbnail
   */
  thumbnailUrl?: string;

  /**
   * @title Thumbnail Data
   * @description Binary data of the image (if not using URL)
   */
  thumbnailData?: Uint8Array;

  /**
   * @title MIME Type
   * @description MIME type of the image (e.g., 'image/jpeg', 'image/png')
   */
  mimeType?: string;
}

export interface UpdateLiveBroadcastThumbnailResult {
  success: boolean;
  message: string;
  broadcast?: LiveBroadcast;
  thumbnails?: Record<string, unknown>;
  error?: unknown;
}

/**
 * @name UPDATE_LIVE_BROADCAST_THUMBNAIL
 * @title Update Broadcast Thumbnail
 * @description Updates the thumbnail of a live broadcast on YouTube
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<UpdateLiveBroadcastThumbnailResult> {
  const {
    broadcastId,
    thumbnailUrl,
    thumbnailData,
    mimeType = "image/jpeg",
  } = props;

  if (!broadcastId) {
    ctx.errorHandler.toHttpError(
      new Error("Broadcast ID is required"),
      "Broadcast ID is required",
    );
  }

  if (!thumbnailUrl && !thumbnailData) {
    ctx.errorHandler.toHttpError(
      new Error("You must provide either a URL or image data"),
      "You must provide either a URL or image data",
    );
  }

  try {
    let imageData: Uint8Array;

    if (thumbnailUrl) {
      const imageResponse = await fetch(thumbnailUrl);
      if (!imageResponse.ok) {
        ctx.errorHandler.toHttpError(
          imageResponse,
          `Failed to download image from URL: ${imageResponse.statusText}`,
        );
      }

      const buffer = await imageResponse.arrayBuffer();
      imageData = new Uint8Array(buffer);
    } else if (thumbnailData) {
      imageData = thumbnailData;
    } else {
      ctx.errorHandler.toHttpError(
        new Error("Image data not available"),
        "Image data not available",
      );
    }

    const uploadResponse = await ctx.client
      ["POST /upload/youtube/v3/liveBroadcasts/thumbnails"](
        {
          uploadType: "media",
          broadcastId: broadcastId,
        },
        {
          headers: {
            "Content-Type": mimeType,
            "Content-Length": imageData.length.toString(),
            Authorization: `Bearer ${ctx.tokens?.access_token}`,
          },
          body: imageData,
        },
      );

    if (!uploadResponse.ok) {
      ctx.errorHandler.toHttpError(
        uploadResponse,
        `Failed to upload thumbnail: ${uploadResponse.statusText}`,
      );
    }

    const responseData = await uploadResponse.json();

    return {
      success: true,
      message: "Thumbnail updated successfully",
      thumbnails: responseData.items?.[0] || responseData,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to update thumbnail",
    );
  }
}

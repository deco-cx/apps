import type { AppContext } from "../../mod.ts";
import { COMMON_ERROR_MESSAGES } from "../../utils/constant.ts";

/**
 * Opções para exclusão de vídeo
 */
export interface Props {
  /**
   * @title Video ID
   * @description ID of the video to be deleted
   */
  videoId: string;

  /**
   * @title On Behalf of Content Owner
   * @description Optional parameter for content owners
   */
  onBehalfOfContentOwner?: string;
}

export interface DeleteVideoResult {
  success: boolean;
}

export interface DeleteVideoError {
  message: string;
  error: boolean;
  code?: number;
  details?: unknown;
}

export type DeleteVideoResponse = DeleteVideoResult | DeleteVideoError;

/**
 * @name DELETE_VIDEO
 * @title Delete Video
 * @description Removes a video from the YouTube channel
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DeleteVideoResult> {
  const {
    videoId,
    onBehalfOfContentOwner,
  } = props;

  if (!videoId) {
    ctx.errorHandler.toHttpError(
      new Error(COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID),
      COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID,
    );
  }

  try {
    const response = await ctx.client["DELETE /videos"](
      {
        id: videoId,
        onBehalfOfContentOwner,
      },
      {},
    );

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Failed to delete video: ${response.statusText}`,
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to process video deletion",
    );
  }
}

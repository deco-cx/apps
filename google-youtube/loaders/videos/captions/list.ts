import { AppContext } from "../../../mod.ts";

export interface Props {
  /**
   * @title Video ID
   * @description ID of the video to fetch captions for
   */
  videoId: string;
}

/**
 * @name LIST_CAPTIONS
 * @title List Video Captions
 * @description Lists all available caption tracks for a specific video.
 */
export default async function list(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { videoId } = props;

  try {
    if (!ctx.tokens?.access_token) {
      throw new Error("Access token not available");
    }

    const captionsListResponse = await ctx.client["GET /captions"]({
      part: "snippet",
      videoId,
    });

    if (!captionsListResponse.ok) {
      throw ctx.errorHandler.toHttpError(
        captionsListResponse,
        `Failed to fetch captions for video ${videoId}`,
      );
    }

    const captionsList = await captionsListResponse.json();
    return captionsList;
  } catch (error) {
    throw ctx.errorHandler.toHttpError(
      error,
      `Error listing captions for video ${videoId}`,
    );
  }
}

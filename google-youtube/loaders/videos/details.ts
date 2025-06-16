import { AppContext } from "../../mod.ts";
import {
  YouTubeCaptionListResponse,
  YoutubeVideoResponse,
} from "../../utils/types.ts";
import { COMMON_ERROR_MESSAGES, YOUTUBE_PARTS } from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Video ID
   * @description ID of the video to fetch details for
   */
  videoId: string;

  /**
   * @title Parts
   * @description Additional parts to include in the response
   */
  parts?: Array<
    | "snippet"
    | "statistics"
    | "contentDetails"
    | "status"
    | "player"
    | "topicDetails"
    | "recordingDetails"
  >;

  /**
   * @title Include Private
   * @description Include private videos in the response
   */
  includePrivate?: boolean;

  /**
   * @title Include Captions
   * @description Include available captions in the response
   */
  includeCaptions?: boolean;
}

export interface VideoDetailsResult {
  video: YoutubeVideoResponse;
  captions?: YouTubeCaptionListResponse;
}

/**
 * @name GET_VIDEO_DETAILS
 * @title Get Video Details
 * @description Retrieves detailed information about a specific video by ID
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<VideoDetailsResult> => {
  const {
    videoId,
    parts = [
      YOUTUBE_PARTS.SNIPPET,
      YOUTUBE_PARTS.STATISTICS,
      YOUTUBE_PARTS.STATUS,
    ],
    includeCaptions = true,
  } = props;

  if (!videoId) {
    ctx.errorHandler.toHttpError(
      new Error(COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID),
      COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID,
    );
  }

  try {
    const partString = parts.join(",");

    const videoResponse = await ctx.client["GET /videos"](
      {
        part: partString,
        id: videoId,
      },
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    if (!videoResponse.ok) {
      ctx.errorHandler.toHttpError(
        videoResponse,
        `Failed to fetch video details: ${videoResponse.statusText}`,
      );
    }

    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      ctx.errorHandler.toHttpError(
        new Error("Video not found"),
        `Video not found: ${videoId}`,
      );
    }

    const result: VideoDetailsResult = {
      video: videoData,
    };

    if (includeCaptions) {
      const captionsResponse = await ctx.client["GET /captions"](
        {
          part: YOUTUBE_PARTS.SNIPPET,
          videoId,
        },
        {
          headers: ctx.tokens?.access_token
            ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
            : {},
        },
      );

      if (captionsResponse.ok) {
        result.captions = await captionsResponse.json();
      }
    }

    return result;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to process video details",
    );
  }
};

export default loader;

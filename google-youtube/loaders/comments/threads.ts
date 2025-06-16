import { AppContext } from "../../mod.ts";
import { YouTubeCommentThreadListResponse } from "../../utils/types.ts";
import {
  COMMON_ERROR_MESSAGES,
  DEFAULT_MAX_RESULTS,
  YOUTUBE_PARTS,
} from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Video ID
   * @description ID of the video to load comment threads from
   */
  videoId: string;

  /**
   * @title Max Results
   * @description Maximum number of results to return
   */
  maxResults?: number;

  /**
   * @title Page Token
   * @description Token for pagination
   */
  pageToken?: string;

  /**
   * @title Order
   * @description Order of comments (by time or relevance)
   */
  order?: "time" | "relevance";
}

export interface ThreadListResponse extends YouTubeCommentThreadListResponse {
  commentsDisabled?: boolean;
}

/**
 * @name GET_COMMENT_THREADS
 * @title Get Comment Threads
 * @description Loads comment threads from a specific YouTube video
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ThreadListResponse> => {
  const {
    videoId,
    maxResults = DEFAULT_MAX_RESULTS,
    pageToken,
    order = "time",
  } = props;

  if (!videoId) {
    ctx.errorHandler.toHttpError(
      new Error(COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID),
      COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID,
    );
  }

  try {
    const response = await ctx.client["GET /commentThreads"](
      {
        part: `${YOUTUBE_PARTS.SNIPPET},replies`,
        videoId,
        maxResults,
        order,
        pageToken,
      },
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => response.text());

      interface YouTubeError {
        error?: {
          errors?: Array<{
            reason?: string;
          }>;
        };
      }

      const typedErrorData = errorData as YouTubeError;
      if (typedErrorData?.error?.errors?.[0]?.reason === "commentsDisabled") {
        return {
          kind: "youtube#commentThreadListResponse",
          etag: "",
          items: [],
          commentsDisabled: true,
        };
      }

      ctx.errorHandler.toHttpError(
        response,
        `Failed to load comment threads: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      `Failed to load comment threads for video ${videoId}`,
    );
  }
};

export default loader;

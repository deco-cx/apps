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
   * @description ID of the video to load comments from
   */
  parentId: string;

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
}

interface CommentListResponse extends YouTubeCommentThreadListResponse {
  commentsDisabled?: boolean;
}

interface YouTubeErrorResponse {
  error?: {
    errors?: Array<{
      reason?: string;
    }>;
  };
}

/**
 * @name GET_VIDEO_COMMENTS
 * @title Get Video Comments
 * @description Loads comments from a specific YouTube video
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CommentListResponse> => {
  const {
    parentId,
    maxResults = DEFAULT_MAX_RESULTS,
    pageToken,
  } = props;

  if (!parentId) {
    ctx.errorHandler.toHttpError(
      new Error(COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID),
      COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID,
    );
  }

  try {
    const response = await ctx.client["GET /commentThreads"](
      {
        part: `${YOUTUBE_PARTS.SNIPPET},replies`,
        videoId: parentId,
        maxResults,
        pageToken,
      },
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => response.text()) as
        | YouTubeErrorResponse
        | string;

      if (
        typeof errorData === "object" &&
        errorData?.error?.errors?.[0]?.reason === "commentsDisabled"
      ) {
        return {
          kind: "youtube#commentThreadListResponse",
          etag: "",
          items: [],
          commentsDisabled: true,
        };
      }

      ctx.errorHandler.toHttpError(
        response,
        `Failed to load comments: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      `Failed to load comments for video ${parentId}`,
    );
  }
};

export default loader;

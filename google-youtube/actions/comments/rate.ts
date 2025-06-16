import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title Comment ID
   * @description ID of the comment to rate
   */
  commentId: string;
  
  /**
   * @title Rating
   * @description Rating to apply to the comment
   */
  rating: "like" | "dislike" | "none";
}

export interface RateCommentResult {
  success: boolean;
  message: string;
  details?: string;
  apiStatus?: number;
}

/**
 * @name RATE_COMMENT
 * @title Rate YouTube Comment
 * @description Sets the rating (like/dislike) on a YouTube comment
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<RateCommentResult> {
  const { commentId, rating } = props;

  if (!commentId) {
    ctx.errorHandler.toHttpError(
      new Error("Comment ID is required"),
      "Comment ID is required",
    );
  }

  if (!rating) {
    ctx.errorHandler.toHttpError(
      new Error("Rating is required"),
      "Rating is required",
    );
  }

  try {
    const response = await ctx.client["POST /comments/rate"](
      {
        id: commentId,
        rating,
      },
      {
        headers: {
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
          "Content-Length": "0",
        },
      }
    );

    if (response.status === 204) {
      return {
        success: true,
        message: `Comment rated successfully: ${rating}`,
      };
    }

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Failed to rate comment: ${response.statusText}`,
      );
    }

    return {
      success: true,
      message: `Comment rated successfully: ${rating}`,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to rate comment",
    );
  }
}

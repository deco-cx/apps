import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title Comment ID
   * @description ID of the comment to be pinned
   */
  commentId: string;
}

export interface PinCommentResult {
  success: boolean;
  message: string;
  pinned?: boolean;
  details?: string;
}

/**
 * @name PIN_COMMENT
 * @title Pin Comment
 * @description Pins a specific comment on a video (requires video owner permission)
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PinCommentResult> {
  const { commentId } = props;

  if (!commentId) {
    ctx.errorHandler.toHttpError(
      new Error("Comment ID is required"),
      "Comment ID is required",
    );
  }

  try {
    const getResponse = await ctx.client["GET /comments"](
      {
        part: "snippet",
        id: commentId,
      },
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    if (!getResponse.ok) {
      ctx.errorHandler.toHttpError(
        getResponse,
        `Failed to get comment data: ${getResponse.statusText}`,
      );
    }

    const commentData = await getResponse.json();

    interface CommentResponse {
      items: Array<{
        id: string;
        snippet: {
          textOriginal: string;
          videoId: string;
          [key: string]: unknown;
        };
      }>;
    }

    const typedCommentData = commentData as CommentResponse;

    if (!typedCommentData.items || typedCommentData.items.length === 0) {
      ctx.errorHandler.toHttpError(
        new Error("Comment not found"),
        "Comment not found",
      );
    }

    const moderationResponse = await ctx.client
      ["POST /comments/setModerationStatus"](
        {
          id: commentId,
          moderationStatus: "published",
          banAuthor: "false",
        },
        {
          headers: {
            Authorization: `Bearer ${ctx.tokens?.access_token}`,
            "Content-Length": "0",
          },
        },
      );

    if (moderationResponse.status !== 204) {
      return {
        success: false,
        message:
          "Could not pin the comment. Verify that you are the video owner.",
        pinned: false,
      };
    }

    const commentSnippet = typedCommentData.items[0].snippet;

    const highlightResponse = await ctx.client["PUT /comments"](
      {
        part: "snippet",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
        },
        body: {
          id: commentId,
          snippet: {
            ...commentSnippet,
            isPublic: true,
            moderationStatus: "published",
          },
        },
      },
    );

    if (!highlightResponse.ok) {
      return {
        success: false,
        message: "The comment was moderated, but could not be highlighted",
        pinned: false,
      };
    }

    return {
      success: true,
      message: "Comment pinned successfully",
      pinned: true,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to process pin comment request",
    );
  }
}

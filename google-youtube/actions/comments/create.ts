import type { AppContext } from "../../mod.ts";
import { COMMON_ERROR_MESSAGES } from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Video ID
   * @description ID of the video to comment on
   */
  videoId: string;

  /**
   * @title Comment Text
   * @description Text content of the comment
   */
  text: string;

  /**
   * @title Pin Comment
   * @description Whether to pin the comment to the video (requires video owner permission)
   */
  pinComment?: boolean;
}

export interface CommentResult {
  success: boolean;
  message: string;
  comment?: unknown;
  pinned?: boolean;
  pinError?: string;
  highlightError?: string;
}

/**
 * @name CREATE_COMMENT
 * @title Send YouTube Comment
 * @description Sends a new comment on a YouTube video with an option to pin the comment
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CommentResult> {
  const { videoId, text, pinComment = false } = props;

  if (!videoId) {
    ctx.errorHandler.toHttpError(
      new Error(COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID),
      COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID,
    );
  }

  if (!text || text.trim() === "") {
    ctx.errorHandler.toHttpError(
      new Error("Comment text is required"),
      "Comment text is required",
    );
  }

  try {
    const response = await ctx.client["POST /commentThreads"](
      { part: "snippet" },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
        },
        body: {
          snippet: {
            videoId,
            topLevelComment: {
              snippet: {
                textOriginal: text,
              },
            },
          },
        },
      },
    );

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Failed to send comment: ${response.statusText}`,
      );
    }

    const commentData = await response.json();

    interface CommentThreadResponse {
      id: string;
      snippet: {
        topLevelComment: {
          id: string;
          snippet: {
            textOriginal: string;
            isPublic?: boolean;
            moderationStatus?: string;
          };
        };
      };
    }

    if (
      pinComment && commentData && (commentData as CommentThreadResponse).id
    ) {
      try {
        const pinResponse = await ctx.client
          ["POST /comments/setModerationStatus"](
            {
              id: (commentData as CommentThreadResponse).snippet.topLevelComment
                .id,
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

        if (pinResponse.status !== 204) {
          return {
            success: true,
            message:
              "Comment sent successfully, but could not pin it (check if you are the video owner)",
            comment: commentData,
            pinned: false,
          };
        }

        const highlightResponse = await ctx.client["PUT /comments"](
          { part: "snippet" },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${ctx.tokens?.access_token}`,
            },
            body: {
              id: (commentData as CommentThreadResponse).snippet.topLevelComment
                .id,
              snippet: {
                ...(commentData as CommentThreadResponse).snippet
                  .topLevelComment.snippet,
                isPublic: true,
                moderationStatus: "published",
                textOriginal: text,
              },
            },
          },
        );

        if (!highlightResponse.ok) {
          return {
            success: true,
            message:
              "Comment sent successfully, but there was a problem highlighting it",
            comment: commentData,
            pinned: false,
          };
        }

        return {
          success: true,
          message: "Comment sent and pinned successfully",
          comment: commentData,
          pinned: true,
        };
      } catch (_pinError) {
        return {
          success: true,
          message:
            "Comment sent successfully, but an error occurred while pinning it",
          comment: commentData,
          pinned: false,
        };
      }
    }

    return {
      success: true,
      message: "Comment sent successfully",
      comment: commentData,
      pinned: false,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to process comment request",
    );
  }
}

import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title Parent Comment ID
   * @description ID of the parent comment to reply to
   */
  parentId: string;

  /**
   * @title Reply Text
   * @description Text content of the reply
   */
  text: string;
}

export interface ReplyCommentResult {
  success: boolean;
  message: string;
  comment?: unknown;
  details?: string;
}

/**
 * @name REPLY_COMMENT
 * @title Reply to Comment
 * @description Replies to an existing YouTube comment
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ReplyCommentResult> {
  const { parentId, text } = props;

  if (!parentId) {
    ctx.errorHandler.toHttpError(
      new Error("Parent comment ID is required"),
      "Parent comment ID is required",
    );
  }

  if (!text || text.trim() === "") {
    ctx.errorHandler.toHttpError(
      new Error("Reply text is required"),
      "Reply text is required",
    );
  }

  try {
    const response = await ctx.client["POST /comments"](
      { part: "snippet" },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
        },
        body: {
          snippet: {
            parentId,
            textOriginal: text,
          },
        },
      },
    );

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Failed to reply to comment: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return {
      success: true,
      message: "Reply sent successfully",
      comment: data,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to reply to comment",
    );
  }
}

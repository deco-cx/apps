import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID where the message is located
   */
  channelId: string;

  /**
   * @title Message ID
   * @description ID of the message to be deleted
   */
  messageId: string;
}

/**
 * @title Delete Message
 * @description Delete a specific Discord message (requires appropriate permissions)
 */
export default async function deleteMessage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const { channelId, messageId } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (!messageId) {
    throw new Error("Message ID is required");
  }

  // Delete message
  const response = await client["DELETE /channels/:channel_id/messages/:message_id"]({
    channel_id: channelId,
    message_id: messageId,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to delete message: ${response.statusText}`,
    );
  }
} 
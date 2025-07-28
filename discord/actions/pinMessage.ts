import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID where the message is located
   */
  channelId: string;

  /**
   * @title Message ID
   * @description ID of the message to be pinned or unpinned
   */
  messageId: string;

  /**
   * @title Action
   * @description Whether to pin or unpin the message
   * @default "pin"
   */
  action: "pin" | "unpin";
}

/**
 * @title Pin/Unpin Message
 * @description Pin or unpin a specific message in a Discord channel
 */
export default async function pinMessage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const { channelId, messageId, action = "pin" } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (!messageId) {
    throw new Error("Message ID is required");
  }

  // Pin or unpin message depending on action
  let response: Response;

  if (action === "pin") {
    response = await client["PUT /channels/:channel_id/pins/:message_id"]({
      channel_id: channelId,
      message_id: messageId,
    });
  } else {
    response = await client["DELETE /channels/:channel_id/pins/:message_id"]({
      channel_id: channelId,
      message_id: messageId,
    });
  }

  if (!response.ok) {
    const actionText = action === "pin" ? "pin" : "unpin";
    ctx.errorHandler.toHttpError(
      response,
      `Failed to ${actionText} message: ${response.statusText}`,
    );
  }
} 
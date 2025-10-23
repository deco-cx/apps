import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal onde está a mensagem
   */
  channelId: string;

  /**
   * @title Message ID
   * @description ID da mensagem a ser deletada
   */
  messageId: string;
}

/**
 * @title Delete Message
 * @description Delete a message from a Discord channel using Bot Token
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
  const response = await client
    ["DELETE /channels/:channel_id/messages/:message_id"]({
      channel_id: channelId,
      message_id: messageId,
    });

  if (!response.ok) {
    throw new Error(`Failed to delete message: ${response.statusText}`);
  }
}

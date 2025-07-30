import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal onde está a mensagem
   */
  channelId: string;

  /**
   * @title Message ID
   * @description ID da mensagem para adicionar reação
   */
  messageId: string;

  /**
   * @title Emoji
   * @description Emoji para adicionar (ex: "👍" ou "custom_emoji:123456789")
   */
  emoji: string;
}

/**
 * @title Add Reaction
 * @description Add an emoji reaction to a Discord message using Bot Token
 */
export default async function addReaction(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> {
  const { channelId, messageId, emoji } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (!messageId) {
    throw new Error("Message ID is required");
  }

  if (!emoji) {
    throw new Error("Emoji is required");
  }

  // Add reaction to message
  const response = await client
    ["PUT /channels/:channel_id/messages/:message_id/reactions/:emoji/@me"]({
      channel_id: channelId,
      message_id: messageId,
      emoji: encodeURIComponent(emoji),
    });

  if (!response.ok) {
    throw new Error(`Failed to add reaction: ${response.statusText}`);
  }

  return { success: true };
}

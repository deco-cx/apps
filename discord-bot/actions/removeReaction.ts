import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal onde está a mensagem
   */
  channelId: string;

  /**
   * @title Message ID
   * @description ID da mensagem da qual remover a reação
   */
  messageId: string;

  /**
   * @title Emoji
   * @description Emoji da reação a ser removida (ex: '👍', 'custom:name:id')
   */
  emoji: string;
}

/**
 * @title Remove Reaction
 * @description Remove bot's reaction from a message in Discord using Bot Token
 */
export default async function removeReaction(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
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

  // Format emoji for URL (encode if needed)
  const encodedEmoji = encodeURIComponent(emoji);

  // Remove reaction
  const response = await client
    ["DELETE /channels/:channel_id/messages/:message_id/reactions/:emoji/@me"]({
      channel_id: channelId,
      message_id: messageId,
      emoji: encodedEmoji,
    });

  if (!response.ok) {
    throw new Error(`Failed to remove reaction: ${response.statusText}`);
  }
}

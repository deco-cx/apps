import type { AppContext } from "../mod.ts";
import { DiscordUser } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal onde está a mensagem
   */
  channelId: string;

  /**
   * @title Message ID
   * @description ID da mensagem para obter reações
   */
  messageId: string;

  /**
   * @title Emoji
   * @description Emoji da reação a ser consultada (ex: '👍', 'custom:name:id')
   */
  emoji: string;

  /**
   * @title After User ID
   * @description Buscar usuários após este ID (para paginação)
   */
  after?: string;

  /**
   * @title Limit
   * @description Número máximo de usuários para retornar (1-100)
   * @default 25
   */
  limit?: number;
}

/**
 * @title Get Message Reactions
 * @description Get users who reacted to a message with a specific emoji using Bot Token
 */
export default async function getMessageReactions(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordUser[]> {
  const { channelId, messageId, emoji, after, limit = 25 } = props;
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

  if (limit < 1 || limit > 100) {
    throw new Error("Limit must be between 1 and 100");
  }

  // Format emoji for URL (encode if needed)
  const encodedEmoji = encodeURIComponent(emoji);

  // Get message reactions
  const response = await client
    ["GET /channels/:channel_id/messages/:message_id/reactions/:emoji"]({
      channel_id: channelId,
      message_id: messageId,
      emoji: encodedEmoji,
      limit,
      after,
    });

  if (!response.ok) {
    throw new Error(`Failed to get message reactions: ${response.statusText}`);
  }

  const users = await response.json();
  return users;
}

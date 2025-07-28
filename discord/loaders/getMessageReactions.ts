import type { AppContext } from "../mod.ts";
import { DiscordUser } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID where the message is located
   */
  channelId: string;

  /**
   * @title Message ID
   * @description ID of the message to get reactions from
   */
  messageId: string;

  /**
   * @title Emoji
   * @description Emoji to get users from (e.g. "👍", "❤️" or "emoji_name:emoji_id")
   */
  emoji: string;

  /**
   * @title Limit
   * @description Maximum number of users to return (1-100, default: 25)
   */
  limit?: number;

  /**
   * @title After User
   * @description User ID - return users after this ID (for pagination)
   */
  after?: string;
}

/**
 * @title Get Message Reactions
 * @description Get users who reacted with a specific emoji to a message
 */
export default async function getMessageReactions(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordUser[]> {
  const { channelId, messageId, emoji, limit = 25, after } = props;
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

  // Validate limit
  const validLimit = Math.min(Math.max(limit, 1), 100);

  // Encode emoji for URL (required for unicode and custom emojis)
  const encodedEmoji = encodeURIComponent(emoji);

  // Get message reactions
  const response = await client["GET /channels/:channel_id/messages/:message_id/reactions/:emoji"]({
    channel_id: channelId,
    message_id: messageId,
    emoji: encodedEmoji,
    limit: validLimit,
    after,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to get message reactions: ${response.statusText}`,
    );
  }

  const users = await response.json();
  return users;
} 
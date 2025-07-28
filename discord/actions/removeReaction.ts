import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID where the message is located
   */
  channelId: string;

  /**
   * @title Message ID
   * @description ID of the message to remove reaction from
   */
  messageId: string;

  /**
   * @title Emoji
   * @description Emoji to remove from reactions (e.g. "👍", "❤️" or "emoji_name:emoji_id")
   */
  emoji: string;
}

/**
 * @title Remove Reaction
 * @description Remove a reaction (emoji) from a specific Discord message
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

  // Encode emoji for URL (required for unicode and custom emojis)
  const encodedEmoji = encodeURIComponent(emoji);

  // Remove reaction
  const response = await client["DELETE /channels/:channel_id/messages/:message_id/reactions/:emoji/@me"]({
    channel_id: channelId,
    message_id: messageId,
    emoji: encodedEmoji,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to remove reaction: ${response.statusText}`,
    );
  }
} 
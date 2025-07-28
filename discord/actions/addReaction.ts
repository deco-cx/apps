import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID where the message is located
   */
  channelId: string;

  /**
   * @title Message ID
   * @description ID of the message to add reaction to
   */
  messageId: string;

  /**
   * @title Emoji
   * @description Emoji to add as reaction (e.g. "👍", "❤️" or "emoji_name:emoji_id")
   */
  emoji: string;
}

/**
 * @title Add Reaction
 * @description Add a reaction (emoji) to a specific Discord message
 */
export default async function addReaction(
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

  // Add reaction
  const response = await client["PUT /channels/:channel_id/messages/:message_id/reactions/:emoji/@me"]({
    channel_id: channelId,
    message_id: messageId,
    emoji: encodedEmoji,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to add reaction: ${response.statusText}`,
    );
  }
} 
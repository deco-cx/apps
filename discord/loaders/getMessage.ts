import type { AppContext } from "../mod.ts";
import { DiscordMessage } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID where the message is located
   */
  channelId: string;

  /**
   * @title Message ID
   * @description Specific message ID to fetch
   */
  messageId: string;
}

/**
 * @title Get Specific Message
 * @description Fetch a specific message by ID from a Discord channel
 */
export default async function getMessage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordMessage> {
  const { channelId, messageId } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (!messageId) {
    throw new Error("Message ID is required");
  }

  // Make request to Discord API
  const response = await client["GET /channels/:channel_id/messages/:message_id"]({
    channel_id: channelId,
    message_id: messageId,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to fetch message: ${response.statusText}`,
    );
  }

  const message = await response.json();
  return message;
} 
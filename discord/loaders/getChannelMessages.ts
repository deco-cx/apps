import type { AppContext } from "../mod.ts";
import { DiscordMessage } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID to fetch messages from
   */
  channelId: string;

  /**
   * @title Limit
   * @description Maximum number of messages to return (1-100, default: 50)
   */
  limit?: number;

  /**
   * @title Before Message
   * @description Message ID - return messages before this message
   */
  before?: string;

  /**
   * @title After Message
   * @description Message ID - return messages after this message
   */
  after?: string;

  /**
   * @title Around Message
   * @description Message ID - return messages around this message
   */
  around?: string;
}

/**
 * @title Get Channel Messages
 * @description Fetch messages from a specific Discord channel with pagination options
 */
export default async function getChannelMessages(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordMessage[]> {
  const { channelId, limit = 50, before, after, around } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  // Validate limit
  const validLimit = Math.min(Math.max(limit, 1), 100);

  // Make request to Discord API
  const response = await client["GET /channels/:channel_id/messages"]({
    channel_id: channelId,
    limit: validLimit,
    before,
    after,
    around,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to fetch channel messages: ${response.statusText}`,
    );
  }

  const messages = await response.json();
  return messages;
} 
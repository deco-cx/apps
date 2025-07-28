import type { AppContext } from "../mod.ts";
import { DiscordMessage } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID to search messages in
   */
  channelId: string;

  /**
   * @title Content Filter
   * @description Search for messages containing this text
   */
  contentFilter?: string;

  /**
   * @title Author ID
   * @description Filter messages by specific author/user ID
   */
  authorId?: string;

  /**
   * @title Has Attachments
   * @description Filter messages that have attachments
   */
  hasAttachments?: boolean;

  /**
   * @title Has Embeds
   * @description Filter messages that have embeds
   */
  hasEmbeds?: boolean;

  /**
   * @title Pinned Only
   * @description Only return pinned messages
   */
  pinnedOnly?: boolean;

  /**
   * @title Before Message
   * @description Get messages before this message ID (for pagination)
   */
  before?: string;

  /**
   * @title After Message
   * @description Get messages after this message ID (for pagination)
   */
  after?: string;

  /**
   * @title Around Message
   * @description Get messages around this message ID
   */
  around?: string;

  /**
   * @title Limit
   * @description Maximum number of messages to return (1-100, default: 50)
   */
  limit?: number;
}

/**
 * @title Search Messages
 * @description Search for messages in a Discord channel with advanced filters
 */
export default async function searchMessages(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordMessage[]> {
  const {
    channelId,
    contentFilter,
    authorId,
    hasAttachments,
    hasEmbeds,
    pinnedOnly,
    before,
    after,
    around,
    limit = 50,
  } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  // Validate limit
  const validLimit = Math.min(Math.max(limit, 1), 100);

  // First, get messages from the channel
  let messages: DiscordMessage[] = [];

  if (pinnedOnly) {
    // Get pinned messages
    const pinnedResponse = await client["GET /channels/:channel_id/pins"]({
      channel_id: channelId,
    });

    if (!pinnedResponse.ok) {
      ctx.errorHandler.toHttpError(
        pinnedResponse,
        `Failed to get pinned messages: ${pinnedResponse.statusText}`,
      );
    }

    messages = await pinnedResponse.json();
  } else {
    // Get regular messages with pagination
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
        `Failed to search messages: ${response.statusText}`,
      );
    }

    messages = await response.json();
  }

  // Apply client-side filters
  let filteredMessages = messages;

  // Filter by content
  if (contentFilter) {
    const lowerContentFilter = contentFilter.toLowerCase();
    filteredMessages = filteredMessages.filter(msg =>
      msg.content.toLowerCase().includes(lowerContentFilter)
    );
  }

  // Filter by author
  if (authorId) {
    filteredMessages = filteredMessages.filter(msg => 
      msg.author.id === authorId
    );
  }

  // Filter by attachments
  if (hasAttachments !== undefined) {
    filteredMessages = filteredMessages.filter(msg => 
      hasAttachments ? msg.attachments.length > 0 : msg.attachments.length === 0
    );
  }

  // Filter by embeds
  if (hasEmbeds !== undefined) {
    filteredMessages = filteredMessages.filter(msg => 
      hasEmbeds ? msg.embeds.length > 0 : msg.embeds.length === 0
    );
  }

  // Sort by timestamp (newest first)
  filteredMessages.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return filteredMessages;
} 
import type { AppContext } from "../mod.ts";
import { DiscordMessage } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID to get message history from
   */
  channelId: string;

  /**
   * @title Limit
   * @description Maximum number of messages to return (1-100, default: 50)
   */
  limit?: number;

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
   * @title Include Reactions
   * @description Whether to include detailed reaction information
   * @default false
   */
  includeReactions?: boolean;

  /**
   * @title Include Embeds
   * @description Whether to include embed information
   * @default true
   */
  includeEmbeds?: boolean;

  /**
   * @title Include Attachments
   * @description Whether to include attachment information
   * @default true
   */
  includeAttachments?: boolean;

  /**
   * @title Reverse Order
   * @description Return messages in chronological order (oldest first)
   * @default false
   */
  reverseOrder?: boolean;

  /**
   * @title From Date
   * @description Only return messages from this date onwards (ISO string)
   */
  fromDate?: string;

  /**
   * @title To Date
   * @description Only return messages up to this date (ISO string)
   */
  toDate?: string;
}

export interface MessageHistoryResponse {
  messages: DiscordMessage[];
  hasMore: boolean;
  nextPageToken?: string;
  previousPageToken?: string;
  totalFiltered: number;
}

/**
 * @title Get Message History
 * @description Get comprehensive message history from a Discord channel with advanced pagination and filtering
 */
export default async function getMessageHistory(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MessageHistoryResponse> {
  const {
    channelId,
    limit = 50,
    before,
    after,
    around,
    includeReactions = false,
    includeEmbeds = true,
    includeAttachments = true,
    reverseOrder = false,
    fromDate,
    toDate,
  } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  // Validate limit
  const validLimit = Math.min(Math.max(limit, 1), 100);

  // Validate dates
  let fromTimestamp: Date | undefined;
  let toTimestamp: Date | undefined;

  if (fromDate) {
    fromTimestamp = new Date(fromDate);
    if (isNaN(fromTimestamp.getTime())) {
      throw new Error("Invalid fromDate format. Use ISO string format.");
    }
  }

  if (toDate) {
    toTimestamp = new Date(toDate);
    if (isNaN(toTimestamp.getTime())) {
      throw new Error("Invalid toDate format. Use ISO string format.");
    }
  }

  if (fromTimestamp && toTimestamp && fromTimestamp >= toTimestamp) {
    throw new Error("fromDate must be before toDate");
  }

  // Get messages from the channel
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
      `Failed to get message history: ${response.statusText}`,
    );
  }

  let messages: DiscordMessage[] = await response.json();
  let totalFiltered = 0;

  // Apply date filters
  if (fromTimestamp || toTimestamp) {
    messages = messages.filter(msg => {
      const msgTimestamp = new Date(msg.timestamp);
      
      if (fromTimestamp && msgTimestamp < fromTimestamp) {
        return false;
      }
      
      if (toTimestamp && msgTimestamp > toTimestamp) {
        return false;
      }
      
      return true;
    });
  }

  totalFiltered = messages.length;

  // Process message content based on options
  messages = messages.map(msg => {
    const processedMsg = { ...msg };

    // Remove embeds if not requested
    if (!includeEmbeds) {
      processedMsg.embeds = [];
    }

    // Remove attachments if not requested
    if (!includeAttachments) {
      processedMsg.attachments = [];
    }

    // Remove detailed reactions if not requested (keep count)
    if (!includeReactions && processedMsg.reactions) {
      processedMsg.reactions = processedMsg.reactions.map(reaction => ({
        ...reaction,
        users: [], // Remove user details, keep emoji and count
      }));
    }

    return processedMsg;
  });

  // Sort messages
  if (reverseOrder) {
    messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } else {
    messages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Determine pagination info
  const hasMore = messages.length === validLimit;
  const nextPageToken = hasMore && messages.length > 0 
    ? reverseOrder 
      ? messages[messages.length - 1].id 
      : messages[messages.length - 1].id
    : undefined;
  
  const previousPageToken = messages.length > 0 
    ? reverseOrder 
      ? messages[0].id 
      : messages[0].id
    : undefined;

  return {
    messages,
    hasMore,
    nextPageToken,
    previousPageToken,
    totalFiltered,
  };
} 
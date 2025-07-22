import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of conversations to return (default: 20, max: 100)
   */
  limit?: number;

  /**
   * @title Start Timestamp
   * @description Filter conversations created after this timestamp (epoch milliseconds)
   */
  startTimestamp?: number;

  /**
   * @title End Timestamp
   * @description Filter conversations created before this timestamp (epoch milliseconds)
   */
  endTimestamp?: number;

  /**
   * @title State
   * @description Filter by conversation state
   */
  state?: "OPEN" | "CLOSED";
}

export interface ConversationThread {
  id: string;
  createdAt: number;
  latestMessageTimestamp: number;
  lastMessageDeliveredTimestamp?: number;
  lastMessageReceivedTimestamp?: number;
  lastMessageSeenTimestamp?: number;
  state: "OPEN" | "CLOSED";
  visitorLastSeenTimestamp?: number;
  assigneeId?: number;
  updatedAt: number;
  inboxId: string;
  contactId?: number;
  actors: Array<{
    actorId: string;
    deliveredTimestamp?: number;
    seenTimestamp?: number;
  }>;
  source: {
    sourceType: string;
    url?: string;
    channel: string;
  };
}

export interface ConversationsResponse {
  results: ConversationThread[];
  hasMore: boolean;
  offset?: string;
}

/**
 * @title Get Conversations
 * @description Retrieve conversations from HubSpot Conversations API
 */
export default async function getConversations(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ConversationsResponse> {
  const { limit = 20, startTimestamp, endTimestamp, state } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<string, string | number | boolean | undefined> =
      {
        limit: Math.min(limit, 100),
      };

    if (startTimestamp) {
      searchParams.startTimestamp = startTimestamp;
    }
    if (endTimestamp) {
      searchParams.endTimestamp = endTimestamp;
    }
    if (state) {
      searchParams.state = state;
    }

    const response = await client.get<ConversationsResponse>(
      "/conversations/v3/conversations/threads",
      searchParams,
    );

    return {
      results: response.results || [],
      hasMore: response.hasMore || false,
      offset: response.offset,
    };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return {
      results: [],
      hasMore: false,
    };
  }
}

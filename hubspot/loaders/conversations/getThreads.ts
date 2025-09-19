import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of threads to return (default: 20, max: 100)
   */
  limit?: number;

  /**
   * @title After
   * @description Cursor for pagination - use the 'after' value from the previous response
   */
  after?: string;

  /**
   * @title Associated Contact ID
   * @description Filter threads by associated contact ID
   */
  associatedContactId?: string;

  /**
   * @title Sort
   * @description Sort threads by field (e.g., latestMessageTimestamp)
   */
  sort?: string;

  /**
   * @title Latest Message Timestamp After
   * @description Filter threads with latest message timestamp after this date (ISO 8601 format)
   */
  latestMessageTimestampAfter?: string;

  /**
   * @title Status
   * @description Filter threads by status (OPEN, CLOSED)
   */
  status?: "OPEN" | "CLOSED";

  /**
   * @title Original Channel ID
   * @description Filter threads by original channel ID
   */
  originalChannelId?: string;

  /**
   * @title Inbox ID
   * @description Filter threads by inbox ID
   */
  inboxId?: string;

  /**
   * @title Assigned To
   * @description Filter threads by assigned user ID
   */
  assignedTo?: string;

  /**
   * @title Archived
   * @description Filter threads by archived status
   */
  archived?: boolean;

  /**
   * @title Spam
   * @description Filter threads by spam status
   */
  spam?: boolean;
}

export interface ThreadAssociations {
  associatedTicketId?: string;
}

export interface Thread {
  associatedContactId?: string;
  threadAssociations?: ThreadAssociations;
  assignedTo?: string;
  createdAt: string;
  archived: boolean;
  originalChannelId?: string;
  latestMessageTimestamp?: string;
  latestMessageSentTimestamp?: string;
  originalChannelAccountId?: string;
  id: string;
  closedAt?: string;
  spam: boolean;
  inboxId: string;
  status: "OPEN" | "CLOSED";
  latestMessageReceivedTimestamp?: string;
}

export interface ThreadsResponse {
  paging: {
    next?: {
      link: string;
      after: string;
    };
  };
  results: Thread[];
}

/**
 * @title Get Threads
 * @description Retrieve a list of conversation threads from HubSpot Conversations API
 */
export default async function getThreads(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ThreadsResponse> {
  const {
    limit = 20,
    after,
    associatedContactId,
    sort,
    latestMessageTimestampAfter,
    status,
    originalChannelId,
    inboxId,
    assignedTo,
    archived,
    spam,
  } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<
      string,
      string | number | boolean | undefined
    > = {};

    if (limit) {
      searchParams.limit = Math.min(limit, 100);
    }
    if (after) {
      searchParams.after = after;
    }
    if (associatedContactId) {
      searchParams.associatedContactId = associatedContactId;
    }
    if (sort) {
      searchParams.sort = sort;
    }
    if (latestMessageTimestampAfter) {
      searchParams.latestMessageTimestampAfter = latestMessageTimestampAfter;
    }
    if (status) {
      searchParams.status = status;
    }
    if (originalChannelId) {
      searchParams.originalChannelId = originalChannelId;
    }
    if (inboxId) {
      searchParams.inboxId = inboxId;
    }
    if (assignedTo) {
      searchParams.assignedTo = assignedTo;
    }
    if (archived !== undefined) {
      searchParams.archived = archived;
    }
    if (spam !== undefined) {
      searchParams.spam = spam;
    }

    const response = await client.get<ThreadsResponse>(
      "/conversations/v3/conversations/threads",
      searchParams,
    );

    return {
      paging: response.paging || { next: undefined },
      results: response.results || [],
    };
  } catch (error) {
    console.error("Error fetching threads:", error);
    return {
      paging: { next: undefined },
      results: [],
    };
  }
}

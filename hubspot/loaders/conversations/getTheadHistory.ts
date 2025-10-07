import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Thread ID
   * @description The ID of the conversation thread to retrieve message history for
   */
  threadId: string;

  /**
   * @title Limit
   * @description Maximum number of messages to return (default: 20, max: 100)
   */
  limit?: number;

  /**
   * @title After
   * @description Cursor for pagination - use the 'after' value from the previous response
   */
  after?: string;
}

export interface DeliveryIdentifier {
  type: string;
  value: string;
}

export interface Sender {
  actorId: string;
  name?: string;
  senderField?: string;
  deliveryIdentifier?: DeliveryIdentifier;
}

export interface Recipient {
  actorId?: string;
  name?: string;
  recipientField?: string;
  deliveryIdentifier?: DeliveryIdentifier;
}

export interface Client {
  clientType: string;
  integrationAppId?: number;
}

export interface Attachment {
  fileUsageType?: string;
  name: string;
  type: string;
  url: string;
  fileId?: string;
}

export interface MessageStatus {
  statusType: string;
  failureDetails?: {
    errorMessageTokens?: Record<string, unknown>;
    errorMessage?: string;
  };
}

export interface Message {
  id: string;
  conversationsThreadId: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  client: Client;
  senders: Sender[];
  recipients: Recipient[];
  archived: boolean;
  text?: string;
  richText?: string;
  attachments: Attachment[];
  subject?: string;
  truncationStatus: string;
  inReplyToId?: string;
  status?: MessageStatus;
  direction?: string;
  channelId?: string;
  channelAccountId?: string;
  type: string;
  newStatus?: string;
}

export interface ThreadHistoryResponse {
  paging: {
    next?: {
      link: string;
      after: string;
    };
  };
  results: Message[];
}

/**
 * @title Get Thread Message History
 * @description Retrieve the message history for a specific conversation thread from HubSpot Conversations API
 */
export default async function getThreadHistory(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ThreadHistoryResponse> {
  const { threadId, limit = 20, after } = props;

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

    const response = await client.get<ThreadHistoryResponse>(
      `/conversations/v3/conversations/threads/${threadId}/messages`,
      searchParams,
    );

    return {
      paging: response.paging || { next: undefined },
      results: response.results || [],
    };
  } catch (error) {
    console.error("Error fetching thread message history:", error);
    return {
      paging: { next: undefined },
      results: [],
    };
  }
}

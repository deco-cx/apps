import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Thread ID
   * @description The ID of the conversation thread to retrieve
   */
  threadId: string;
}

export interface ThreadAssociations {
  /**
   * @title Associated Ticket ID
   * @description The ID of the associated ticket in the CRM
   */
  associatedTicketId?: string;
}

export interface Thread {
  /**
   * @title Associated Contact ID
   * @description The ID of the associated Contact in the CRM. If the Contact for the thread has not yet been added or created, the associatedContactId returned will be a visitorID and cannot be used to search for the Contact in the CRM.
   */
  associatedContactId?: string;

  /**
   * @title Thread Associations
   * @description Associations related to the thread (e.g., tickets)
   */
  threadAssociations?: ThreadAssociations;

  /**
   * @title Assigned To
   * @description The ID of the user the thread is assigned to
   */
  assignedTo?: string;

  /**
   * @title Created At
   * @description When the thread was created
   */
  createdAt: string;

  /**
   * @title Archived
   * @description Whether this thread is archived
   */
  archived?: boolean;

  /**
   * @title Original Channel ID
   * @description The ID of the original channel
   */
  originalChannelId: string;

  /**
   * @title Latest Message Timestamp
   * @description The time that the latest message was sent or received on the thread
   */
  latestMessageTimestamp?: string;

  /**
   * @title Latest Message Sent Timestamp
   * @description The time that the latest message was sent on the thread
   */
  latestMessageSentTimestamp?: string;

  /**
   * @title Original Channel Account ID
   * @description The ID of the original channel account
   */
  originalChannelAccountId: string;

  /**
   * @title Thread ID
   * @description The unique ID of the thread
   */
  id: string;

  /**
   * @title Closed At
   * @description When the thread was closed. Only set if the thread is closed.
   */
  closedAt?: string;

  /**
   * @title Spam
   * @description Whether the thread is marked as spam
   */
  spam: boolean;

  /**
   * @title Inbox ID
   * @description The ID of the conversations inbox containing the thread
   */
  inboxId: string;

  /**
   * @title Status
   * @description The thread's status: OPEN or CLOSED
   */
  status: "OPEN" | "CLOSED";

  /**
   * @title Latest Message Received Timestamp
   * @description The time that the latest message was received on the thread
   */
  latestMessageReceivedTimestamp?: string;
}

/**
 * @title Get Thread
 * @description Retrieve a single conversation thread by its ID from HubSpot Conversations API
 */
export default async function getThread(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Thread> {
  const { threadId } = props;

  const client = new HubSpotClient(ctx);

  const response = await client.get<Thread>(
    `/conversations/v3/conversations/threads/${threadId}`,
  );

  return response;
}

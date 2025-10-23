import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Thread ID
   * @description The ID of the conversation thread to update
   */
  threadId: string;

  /**
   * @title Archived
   * @description Whether this thread is archived. Set to false to restore the thread.
   */
  archived?: boolean;

  /**
   * @title Status
   * @description The thread's status: OPEN or CLOSED
   */
  status?: "OPEN" | "CLOSED";
}

export interface ThreadAssociations {
  /**
   * @title Associated Ticket ID
   * @description ID of the associated ticket
   */
  associatedTicketId?: string;
}

export interface ThreadResponse {
  /**
   * @title Associated Contact ID
   * @description The ID of the associated Contact in the CRM
   */
  associatedContactId: string;

  /**
   * @title Thread Associations
   * @description Associated records for this thread
   */
  threadAssociations?: ThreadAssociations;

  /**
   * @title Assigned To
   * @description ID of the user assigned to this thread
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
   * @description ID of the original channel
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
   * @description ID of the original channel account
   */
  originalChannelAccountId: string;

  /**
   * @title Thread ID
   * @description The unique ID of the thread
   */
  id: string;

  /**
   * @title Closed At
   * @description When the thread was closed. Only set if the thread is closed
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
 * @title Update Thread
 * @description Updates a single thread. Either a thread's status can be updated, or the thread can be restored.
 */
export default async function updateThread(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ThreadResponse> {
  const { threadId, archived, status } = props;

  const client = new HubSpotClient(ctx);

  const updateData: Record<string, unknown> = {};

  if (archived !== undefined) {
    updateData.archived = archived;
  }

  if (status !== undefined) {
    updateData.status = status;
  }

  const response = await client.patch<ThreadResponse>(
    `/conversations/v3/conversations/threads/${threadId}`,
    updateData,
  );

  return response;
}

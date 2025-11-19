import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Attachment {
  /**
   * @title Attachment Type
   * @description Type of attachment
   */
  type: "FILE" | "QUICK_REPLIES" | "SOCIAL_MEDIA_METADATA";

  /**
   * @title File ID
   * @description ID of the file (required for FILE type)
   */
  fileId?: string;

  /**
   * @title Name
   * @description Name of the attachment
   */
  name?: string;

  /**
   * @title URL
   * @description URL of the attachment
   */
  url?: string;

  /**
   * @title File Usage Type
   * @description Usage type for the file
   */
  fileUsageType?: string;
}

export interface Props {
  /**
   * @title Thread ID
   * @description The ID of the conversation thread
   */
  threadId: string;

  /**
   * @title Comment Text
   * @description The text content of the comment
   */
  text: string;

  /**
   * @title Rich Text
   * @description Rich text content (HTML)
   */
  richText?: string;

  /**
   * @title Attachments
   * @description Array of attachments
   */
  attachments?: Attachment[];
}

export interface Client {
  clientType: "HUBSPOT";
  integrationAppId: number;
}

export interface Sender {
  actorId: string;
  name?: string;
  senderField?: string;
  deliveryIdentifier?: {
    type: string;
    value: string;
  };
}

export interface MessageRecipient {
  actorId: string;
  name?: string;
  deliveryIdentifier?: {
    type: string;
    value: string;
  };
  recipientField?: string;
}

export interface FailureDetails {
  errorMessageTokens: Record<string, unknown>;
  errorMessage?: string;
}

export interface MessageStatus {
  statusType: "SENT" | "FAILED" | "PENDING";
  failureDetails?: FailureDetails;
}

export interface CommentResponse {
  type: "COMMENT";
  id: string;
  conversationsThreadId: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  client: Client;
  senders: Sender[];
  recipients: MessageRecipient[];
  archived: boolean;
  text?: string;
  richText?: string;
  attachments: Attachment[];
  subject?: string;
  truncationStatus:
    | "NOT_TRUNCATED"
    | "TRUNCATED_TO_MOST_RECENT_REPLY"
    | "TRUNCATED";
  inReplyToId?: string;
  status?: MessageStatus;
  direction: "INCOMING" | "OUTGOING";
  channelId: string;
  channelAccountId: string;
}

/**
 * @title Send Thread Comment
 * @description Send a comment to a conversation thread
 */
export default async function sendThreadComment(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CommentResponse> {
  const { threadId, text, richText, attachments = [] } = props;

  const client = new HubSpotClient(ctx);

  const commentData: Record<string, unknown> = {
    type: "COMMENT",
    text,
    ...(richText && { richText }),
    ...(attachments.length > 0 && { attachments }),
  };

  const response = await client.post<CommentResponse>(
    `/conversations/v3/conversations/threads/${threadId}/messages`,
    commentData,
  );

  return response;
}

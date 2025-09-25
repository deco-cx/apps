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

export interface DeliveryIdentifier {
  /**
   * @title Type
   * @description Type of delivery identifier
   */
  type: string;

  /**
   * @title Value
   * @description Value of the delivery identifier
   */
  value: string;
}

export interface Recipient {
  /**
   * @title Delivery Identifiers
   * @description Array of delivery identifiers
   */
  deliveryIdentifiers?: DeliveryIdentifier[];

  /**
   * @title Actor ID
   * @description ID of the actor
   */
  actorId?: string;

  /**
   * @title Name
   * @description Name of the recipient
   */
  name?: string;

  /**
   * @title Delivery Identifier
   * @description Single delivery identifier
   */
  deliveryIdentifier?: DeliveryIdentifier;

  /**
   * @title Recipient Field
   * @description Field identifier for the recipient
   */
  recipientField?: string;
}

export interface Props {
  /**
   * @title Thread ID
   * @description The ID of the conversation thread
   */
  threadId: string;

  /**
   * @title Message Text
   * @description The text content of the message
   */
  text: string;

  /**
   * @title Sender Actor ID
   * @description ID of the sender actor
   */
  senderActorId: string;

  /**
   * @title Channel ID
   * @description The channel ID
   */
  channelId: string;

  /**
   * @title Channel Account ID
   * @description The channel account ID
   */
  channelAccountId: string;

  /**
   * @title Recipients
   * @description Array of recipients
   */
  recipients?: Recipient[];

  /**
   * @title Subject
   * @description Subject of the message
   */
  subject?: string;

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
  deliveryIdentifier?: DeliveryIdentifier;
}

export interface MessageRecipient {
  actorId: string;
  name?: string;
  deliveryIdentifier?: DeliveryIdentifier;
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

export interface MessageResponse {
  type: "MESSAGE";
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
 * @title Send Thread Message
 * @description Send a message to a conversation thread
 */
export default async function sendThreadMessage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MessageResponse> {
  const {
    threadId,
    text,
    senderActorId,
    channelId,
    channelAccountId,
    recipients = [],
    subject,
    richText,
    attachments = [],
  } = props;

  const client = new HubSpotClient(ctx);

  const messageData: Record<string, unknown> = {
    type: "MESSAGE",
    text,
    senderActorId,
    channelId,
    channelAccountId,
    ...(richText && { richText }),
    ...(attachments.length > 0 && { attachments }),
    ...(recipients.length > 0 && { recipients }),
    ...(subject && { subject }),
  };

  const response = await client.post<MessageResponse>(
    `/conversations/v3/conversations/threads/${threadId}/messages`,
    messageData,
  );

  return response;
}

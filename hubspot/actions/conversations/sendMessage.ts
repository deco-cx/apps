import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Thread ID
   * @description The ID of the conversation thread
   */
  threadId: string;

  /**
   * @title Message Type
   * @description Type of message to send
   */
  type: "MESSAGE" | "COMMENT";

  /**
   * @title Message Text
   * @description The text content of the message
   */
  text: string;

  /**
   * @title Rich Text
   * @description Rich text content (HTML)
   */
  richText?: string;

  /**
   * @title Channel ID
   * @description The channel ID for the message
   */
  channelId?: string;

  /**
   * @title Channel Account ID
   * @description The channel account ID
   */
  channelAccountId?: string;
}

export interface MessageResponse {
  id: string;
  createdAt: number;
  type: string;
  text: string;
  richText?: string;
  senderActorId: string;
  recipients: Array<{
    actorId: string;
    deliveredTimestamp?: number;
  }>;
  channelId: string;
  channelAccountId: string;
}

/**
 * @title Send Message
 * @description Send a message in a conversation thread
 */
export default async function sendMessage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MessageResponse> {
  const { threadId, type, text, richText, channelId, channelAccountId } = props;

  const client = new HubSpotClient(ctx);

  const messageData = {
    type,
    text,
    ...(richText && { richText }),
    ...(channelId && { channelId }),
    ...(channelAccountId && { channelAccountId }),
  };

  const response = await client.post<MessageResponse>(
    `/conversations/v3/conversations/threads/${threadId}/messages`,
    messageData,
  );

  return response;
}

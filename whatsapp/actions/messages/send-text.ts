import type { AppContext } from "../../mod.ts";
import type { MessageResponse } from "../../client.ts";

export interface Props {
  /**
   * @title Recipient Phone Number
   * @description The phone number of the recipient with country code (e.g., 551199999999)
   */
  to: string;

  /**
   * @title Message Text
   * @description The text content of the message
   */
  text: string;

  /**
   * @title Enable URL Preview
   * @description Enable preview for URLs in the message
   * @default false
   */
  previewUrl?: boolean;

  /**
   * @title Reply To Message ID
   * @description The ID of a message to reply to
   */
  replyToMessageId?: string;
}

/**
 * @title Send Text Message
 * @description Send a text message to a WhatsApp user
 */
export default async function sendTextMessage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MessageResponse> {
  const { to, text, previewUrl = false, replyToMessageId } = props;

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: {
      body: text,
      preview_url: previewUrl,
    },
  } as const;

  // Add reply context if replying to a message
  if (replyToMessageId) {
    Object.assign(body, {
      context: {
        message_id: replyToMessageId,
      },
    });
  }

  const response = await ctx.api["POST /:phone_number_id/messages"]({
    phone_number_id: ctx.phoneNumberId,
  }, {
    body,
  });

  return await response.json();
}

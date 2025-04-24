import type { AppContext } from "../../mod.ts";
import type { MessageResponse } from "../../client.ts";

export interface Props {
  /**
   * @title Message ID
   * @description The ID of the message to mark as read
   */
  messageId: string;
}

/**
 * @title Mark Message as Read
 * @description Mark a message as read by its ID
 */
export default async function markMessageAsRead(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MessageResponse> {
  const { messageId } = props;

  const body = {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  } as const;

  const response = await ctx.api["POST /:phone_number_id/messages/mark_read"]({
    phone_number_id: ctx.phoneNumberId,
  }, {
    body,
  });

  return await response.json();
}

import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Webhook ID
   * @description ID do webhook a ser deletado
   */
  webhookId: string;

  /**
   * @title Webhook Token
   * @description Token do webhook
   */
  webhookToken: string;
}

/**
 * @title Delete Webhook
 * @description Delete a Discord webhook using its ID and token
 */
export default async function deleteWebhook(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const { webhookId, webhookToken } = props;
  const { client } = ctx;

  if (!webhookId) {
    throw new Error("Webhook ID is required");
  }

  if (!webhookToken) {
    throw new Error("Webhook token is required");
  }

  // Delete webhook
  const response = await client["DELETE /webhooks/:webhook_id/:webhook_token"]({
    webhook_id: webhookId,
    webhook_token: webhookToken,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete webhook: ${response.statusText}`);
  }
}

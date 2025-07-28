import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Webhook ID
   * @description ID of the webhook to delete
   */
  webhookId: string;

  /**
   * @title Reason
   * @description Reason for deleting the webhook (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Delete Webhook
 * @description Delete a Discord webhook permanently (requires Manage Webhooks permission)
 */
export default async function deleteWebhook(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const { webhookId, reason } = props;
  const { client } = ctx;

  if (!webhookId) {
    throw new Error("Webhook ID is required");
  }

  // Delete webhook
  const response = await client["DELETE /webhooks/:webhook_id"]({
    webhook_id: webhookId,
    reason,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to delete webhook: ${response.statusText}`,
    );
  }
} 
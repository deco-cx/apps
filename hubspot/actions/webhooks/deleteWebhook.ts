import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Webhook ID
   * @description The ID of the webhook subscription to delete
   */
  webhookId: string;
}

export interface DeleteResult {
  success: boolean;
  webhookId: string;
  message?: string;
}

/**
 * @title Delete Webhook
 * @description Delete a webhook subscription
 */
export default async function deleteWebhook(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DeleteResult> {
  const { webhookId } = props;

  try {
    const client = new HubSpotClient(ctx);
    await client.delete(`/webhooks/v3/subscriptions/${webhookId}`);

    return {
      success: true,
      webhookId,
      message: "Webhook successfully deleted",
    };
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return {
      success: false,
      webhookId,
      message: error instanceof Error
        ? error.message
        : "Unknown error occurred",
    };
  }
}

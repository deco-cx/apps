import type { AppContext } from "../mod.ts";
import { DiscordWebhook } from "../utils/client.ts";

export interface Props {
  /**
   * @title Webhook ID
   * @description ID of the webhook to edit
   */
  webhookId: string;

  /**
   * @title Webhook Name
   * @description New name for the webhook (1-80 characters)
   */
  name?: string;

  /**
   * @title Avatar
   * @description New avatar for the webhook (base64 encoded image data, or null to remove)
   */
  avatar?: string | null;

  /**
   * @title Channel ID
   * @description Move webhook to different channel
   */
  channelId?: string;

  /**
   * @title Reason
   * @description Reason for editing the webhook (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Edit Webhook
 * @description Edit an existing Discord webhook (requires Manage Webhooks permission)
 */
export default async function editWebhook(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordWebhook> {
  const { webhookId, name, avatar, channelId, reason } = props;
  const { client } = ctx;

  if (!webhookId) {
    throw new Error("Webhook ID is required");
  }

  // Build request body (only include provided fields)
  const body: any = {};

  if (name !== undefined) {
    if (name.length < 1 || name.length > 80) {
      throw new Error("Webhook name must be between 1 and 80 characters");
    }
    body.name = name;
  }

  if (avatar !== undefined) {
    body.avatar = avatar; // Can be string (new avatar) or null (remove avatar)
  }

  if (channelId !== undefined) {
    body.channel_id = channelId;
  }

  if (reason) {
    body.reason = reason;
  }

  // Check if at least one field is being updated
  if (Object.keys(body).filter(key => key !== 'reason').length === 0) {
    throw new Error("At least one field must be provided to edit the webhook");
  }

  // Edit webhook
  const response = await client["PATCH /webhooks/:webhook_id"]({
    webhook_id: webhookId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to edit webhook: ${response.statusText}`,
    );
  }

  const webhook = await response.json();
  return webhook;
} 
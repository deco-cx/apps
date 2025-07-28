import type { AppContext } from "../mod.ts";
import { DiscordWebhook } from "../utils/client.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID where to create the webhook
   */
  channelId: string;

  /**
   * @title Webhook Name
   * @description Name of the webhook (1-80 characters)
   */
  name: string;

  /**
   * @title Avatar
   * @description Avatar for the webhook (base64 encoded image data)
   */
  avatar?: string;

  /**
   * @title Reason
   * @description Reason for creating the webhook (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Create Webhook
 * @description Create a new webhook for a Discord channel (requires Manage Webhooks permission)
 */
export default async function createWebhook(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordWebhook> {
  const { channelId, name, avatar, reason } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (!name) {
    throw new Error("Webhook name is required");
  }

  if (name.length < 1 || name.length > 80) {
    throw new Error("Webhook name must be between 1 and 80 characters");
  }

  // Build request body
  const body: any = {
    name,
  };

  if (avatar) {
    body.avatar = avatar;
  }

  if (reason) {
    body.reason = reason;
  }

  // Create webhook
  const response = await client["POST /channels/:channel_id/webhooks"]({
    channel_id: channelId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to create webhook: ${response.statusText}`,
    );
  }

  const webhook = await response.json();
  return webhook;
} 
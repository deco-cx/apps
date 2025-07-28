import type { AppContext } from "../mod.ts";
import { DiscordWebhook } from "../utils/client.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID to list webhooks from
   */
  channelId: string;
}

/**
 * @title List Channel Webhooks
 * @description List all webhooks from a specific Discord channel
 */
export default async function listWebhooks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordWebhook[]> {
  const { channelId } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  // Get channel webhooks
  const response = await client["GET /channels/:channel_id/webhooks"]({
    channel_id: channelId,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to list channel webhooks: ${response.statusText}`,
    );
  }

  const webhooks = await response.json();
  return webhooks;
} 
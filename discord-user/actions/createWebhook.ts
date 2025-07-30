import type { AppContext } from "../mod.ts";
import { DiscordGuild, DiscordUser } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal Discord onde criar o webhook
   */
  channelId: string;

  /**
   * @title Webhook Name
   * @description Nome do webhook (1-80 caracteres)
   */
  name: string;

  /**
   * @title Avatar
   * @description URL ou base64 da imagem de avatar do webhook
   */
  avatar?: string;
}

export interface WebhookResponse {
  id: string;
  type: number;
  guild_id?: string;
  channel_id: string;
  user?: DiscordUser;
  name?: string;
  avatar?: string;
  token?: string;
  application_id?: string;
  source_guild?: DiscordGuild;
  source_channel?: unknown;
  url?: string;
}

/**
 * @title Create Webhook
 * @description Create a webhook in a Discord channel (OAuth - scope: webhook.incoming)
 */
export default async function createWebhook(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<WebhookResponse> {
  const { channelId, name, avatar } = props;
  const { tokens } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (!name) {
    throw new Error("Webhook name is required");
  }

  if (name.length < 1 || name.length > 80) {
    throw new Error("Webhook name must be between 1-80 characters");
  }

  if (!tokens?.access_token) {
    throw new Error("Access token is required");
  }

  // Create webhook
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/webhooks`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        avatar,
      }),
    },
  );

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to create webhook: ${response.statusText}`,
    );
  }

  const webhook = await response.json();
  return webhook;
}

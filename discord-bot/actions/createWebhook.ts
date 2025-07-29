import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal onde criar o webhook
   */
  channelId: string;

  /**
   * @title Webhook Name
   * @description Nome do webhook (1-80 caracteres)
   */
  name: string;

  /**
   * @title Avatar
   * @description Avatar do webhook (base64 image data: data:image/jpeg;base64,...)
   */
  avatar?: string;
}

export interface WebhookResponse {
  /**
   * @title Webhook ID
   * @description ID único do webhook
   */
  id: string;

  /**
   * @title Type
   * @description Tipo do webhook
   */
  type: number;

  /**
   * @title Guild ID
   * @description ID do servidor
   */
  guild_id?: string;

  /**
   * @title Channel ID
   * @description ID do canal
   */
  channel_id: string;

  /**
   * @title Name
   * @description Nome do webhook
   */
  name?: string;

  /**
   * @title Avatar
   * @description Avatar do webhook
   */
  avatar?: string;

  /**
   * @title Token
   * @description Token do webhook para execução
   */
  token?: string;

  /**
   * @title URL
   * @description URL completa do webhook
   */
  url?: string;
}

/**
 * @title Create Webhook
 * @description Create a webhook in a Discord channel using Bot Token
 */
export default async function createWebhook(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<WebhookResponse> {
  const { channelId, name, avatar } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (!name) {
    throw new Error("Webhook name is required");
  }

  if (name.length < 1 || name.length > 80) {
    throw new Error("Webhook name must be between 1-80 characters");
  }

  // Build request body
  const body: any = {
    name,
  };

  if (avatar) {
    body.avatar = avatar;
  }

  // Create webhook
  const response = await client["POST /channels/:channel_id/webhooks"]({
    channel_id: channelId,
  }, {
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to create webhook: ${response.statusText}`);
  }

  const webhook = await response.json();
  return webhook;
}
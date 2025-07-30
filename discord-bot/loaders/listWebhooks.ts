import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal para listar webhooks (deixe vazio para usar Guild ID)
   */
  channelId?: string;

  /**
   * @title Guild ID
   * @description ID do servidor para listar webhooks (será ignorado se Channel ID for fornecido)
   */
  guildId?: string;
}

export interface WebhookInfo {
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
   * @description Token do webhook
   */
  token?: string;

  /**
   * @title URL
   * @description URL completa do webhook
   */
  url?: string;
}

/**
 * @title List Webhooks
 * @description List webhooks from a Discord channel or guild using Bot Token
 */
export default async function listWebhooks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<WebhookInfo[]> {
  const { channelId, guildId } = props;
  const { client } = ctx;

  if (!channelId && !guildId) {
    throw new Error("Either Channel ID or Guild ID is required");
  }

  let response;

  if (channelId) {
    // List webhooks for specific channel
    response = await client["GET /channels/:channel_id/webhooks"]({
      channel_id: channelId,
    });
  } else if (guildId) {
    // List webhooks for entire guild
    response = await client["GET /guilds/:guild_id/webhooks"]({
      guild_id: guildId,
    });
  }

  if (!response || !response.ok) {
    throw new Error(
      `Failed to list webhooks: ${response?.statusText || "Unknown error"}`,
    );
  }

  const webhooks = await response.json();
  return webhooks;
}

import type { AppContext } from "../mod.ts";
import { DiscordChannel } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID do servidor Discord onde criar o canal
   */
  guildId: string;

  /**
   * @title Channel Name
   * @description Nome do canal (2-100 caracteres)
   */
  name: string;

  /**
   * @title Channel Type
   * @description Tipo do canal (0=Text, 2=Voice, 4=Category, 5=News)
   * @default 0
   */
  type?: number;

  /**
   * @title Topic
   * @description Tópico do canal (máximo 1024 caracteres)
   */
  topic?: string;

  /**
   * @title NSFW
   * @description Se o canal é NSFW (Not Safe For Work)
   * @default false
   */
  nsfw?: boolean;

  /**
   * @title Parent ID
   * @description ID da categoria pai (para organizar canais)
   */
  parentId?: string;

  /**
   * @title Position
   * @description Posição do canal na lista
   */
  position?: number;

  /**
   * @title Bitrate
   * @description Taxa de bits do canal de voz
   */
  bitrate?: number;

  /**
   * @title User Limit
   * @description Limite de usuários do canal de voz
   */
  user_limit?: number;

  /**
   * @title Rate Limit Per User
   * @description Taxa de limite de mensagens por usuário
   */
  rate_limit_per_user?: number;

  /**
   * @title Permission Overwrites
   * @description Permissões do canal
   */
  permission_overwrites?: unknown[];
}

/**
 * @title Create Channel
 * @description Create a new channel in a Discord guild using Bot Token
 */
export default async function createChannel(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordChannel> {
  const {
    guildId,
    name,
    type = 0,
    topic,
    nsfw = false,
    parentId,
    position,
    bitrate,
    user_limit,
    rate_limit_per_user,
    permission_overwrites,
  } = props;
  const { client } = ctx;

  const response = await client["POST /guilds/:guild_id/channels"](
    { guild_id: guildId },
    {
      body: {
        name: name,
        type,
        topic,
        bitrate,
        user_limit,
        rate_limit_per_user,
        position,
        permission_overwrites,
        parent_id: parentId,
        nsfw,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to create channel: ${response.statusText}`);
  }

  return await response.json();
}

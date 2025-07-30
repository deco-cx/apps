import type { AppContext } from "../mod.ts";
import { DiscordGuildMember } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID do servidor Discord onde adicionar o usuário
   */
  guildId: string;

  /**
   * @title User ID
   * @description ID do usuário a ser adicionado ao servidor
   */
  userId: string;

  /**
   * @title Nickname
   * @description Nickname opcional para o usuário no servidor
   */
  nick?: string;

  /**
   * @title Roles
   * @description IDs dos cargos a serem atribuídos ao usuário
   */
  roles?: string[];

  /**
   * @title Mute
   * @description Se o usuário deve entrar mutado
   * @default false
   */
  mute?: boolean;

  /**
   * @title Deaf
   * @description Se o usuário deve entrar surdo
   * @default false
   */
  deaf?: boolean;
}

/**
 * @title Add User to Guild
 * @description Add the authenticated user to a Discord server (OAuth - scope: guilds.join)
 */
export default async function addUserToGuild(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordGuildMember> {
  const { guildId, userId, nick, roles, mute = false, deaf = false } = props;
  const { client } = ctx;

  const response = await client["PUT /guilds/:guild_id/members/:user_id"]({
    guild_id: guildId,
    user_id: userId,
  }, {
    body: {
      nick,
      roles,
      mute,
      deaf,
    },
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to add user to guild: ${response.statusText}`,
    );
  }

  const member = await response.json();
  return member;
}

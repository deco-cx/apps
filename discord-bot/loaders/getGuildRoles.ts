import type { AppContext } from "../mod.ts";
import { DiscordRole } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID do servidor para listar roles
   */
  guildId: string;
}

export interface GuildRolesResponse {
  /**
   * @title Roles
   * @description Lista de roles do servidor
   */
  roles: DiscordRole[];
}

/**
 * @title Get Guild Roles
 * @description Get all roles from a Discord server using Bot Token
 */
export default async function getGuildRoles(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GuildRolesResponse> {
  const { guildId } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  // Get guild roles
  const response = await client["GET /guilds/:guild_id/roles"]({
    guild_id: guildId,
  });

  if (!response.ok) {
    throw new Error(`Failed to get guild roles: ${response.statusText}`);
  }

  const roles = await response.json();
  return { roles };
}

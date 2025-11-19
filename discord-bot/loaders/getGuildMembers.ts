import type { AppContext } from "../mod.ts";
import { DiscordGuildMember } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID do servidor Discord para listar membros
   */
  guildId: string;

  /**
   * @title Limit
   * @description Número máximo de membros a retornar (1-1000, padrão: 1)
   */
  limit?: number;

  /**
   * @title After
   * @description ID do usuário - buscar membros após este ID (paginação)
   */
  after?: string;
}

export interface GuildMembersResponse {
  /**
   * @title Members
   * @description Lista de membros do servidor
   */
  members: DiscordGuildMember[];
}

/**
 * @title Get Guild Members
 * @description List members of a Discord guild using Bot Token
 */
export default async function getGuildMembers(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GuildMembersResponse> {
  const { guildId, limit = 1, after } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  // Validate limit
  const validLimit = Math.min(Math.max(limit, 1), 1000);

  // Get guild members
  const response = await client["GET /guilds/:guild_id/members"]({
    guild_id: guildId,
    limit: validLimit,
    after,
  });

  if (!response.ok) {
    throw new Error(`Failed to get guild members: ${response.statusText}`);
  }

  const members = await response.json();
  return { members };
}

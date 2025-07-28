import type { AppContext } from "../mod.ts";
import { DiscordRole } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID to list roles from
   */
  guildId: string;
}

/**
 * @title List Guild Roles
 * @description List all roles from a specific Discord guild
 */
export default async function getGuildRoles(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordRole[]> {
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
    ctx.errorHandler.toHttpError(
      response,
      `Failed to list guild roles: ${response.statusText}`,
    );
  }

  const roles = await response.json();
  return roles;
} 
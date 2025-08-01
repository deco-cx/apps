import type { AppContext } from "../mod.ts";
import { DiscordGuild } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID do servidor Discord
   */
  guildId: string;

  /**
   * @title With Counts
   * @description Incluir contagens aproximadas de membros
   * @default false
   */
  withCounts?: boolean;
}

/**
 * @title Get Guild
 * @description Get information about a Discord guild using Bot Token
 */
export default async function getGuild(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordGuild> {
  const { guildId, withCounts = false } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  // Get guild information
  const response = await client["GET /guilds/:guild_id"]({
    guild_id: guildId,
    with_counts: withCounts,
  });

  if (!response.ok) {
    throw new Error(`Failed to get guild: ${response.statusText}`);
  }

  const guild = await response.json();
  return guild;
}

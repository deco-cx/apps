import type { AppContext } from "../mod.ts";
import { DiscordGuild } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID to get information from
   */
  guildId: string;

  /**
   * @title Include Counts
   * @description Whether to include approximate member and presence counts
   * @default false
   */
  withCounts?: boolean;
}

/**
 * @title Get Guild Information
 * @description Get detailed information about a specific Discord guild
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
    ctx.errorHandler.toHttpError(
      response,
      `Failed to get guild information: ${response.statusText}`,
    );
  }

  const guild = await response.json();
  return guild;
} 
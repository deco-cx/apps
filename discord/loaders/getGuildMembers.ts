import type { AppContext } from "../mod.ts";
import { DiscordGuildMember } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID to list members from
   */
  guildId: string;

  /**
   * @title Limit
   * @description Maximum number of members to return (1-1000, default: 100)
   */
  limit?: number;

  /**
   * @title After Member
   * @description Member ID - return members after this ID (for pagination)
   */
  after?: string;
}

/**
 * @title List Guild Members
 * @description List members from a specific Discord guild with pagination
 */
export default async function getGuildMembers(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordGuildMember[]> {
  const { guildId, limit = 100, after } = props;
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
    ctx.errorHandler.toHttpError(
      response,
      `Failed to list guild members: ${response.statusText}`,
    );
  }

  const members = await response.json();
  return members;
} 
import type { AppContext } from "../mod.ts";
import { DiscordGuild } from "../utils/types.ts";

export interface Props {
  /**
   * @title Before Guild
   * @description Guild ID - return guilds before this ID (for pagination)
   */
  before?: string;

  /**
   * @title After Guild
   * @description Guild ID - return guilds after this ID (for pagination)
   */
  after?: string;

  /**
   * @title Limit
   * @description Maximum number of guilds to return (1-200, default: 200)
   */
  limit?: number;

  /**
   * @title With Counts
   * @description Whether to include approximate member and presence counts
   * @default false
   */
  withCounts?: boolean;
}

/**
 * @title Get User Guilds
 * @description Get guilds that the current user is a member of (OAuth - scope: guilds)
 */
export default async function getUserGuilds(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordGuild[]> {
  const { before, after, limit = 200, withCounts = false } = props;
  const { client } = ctx;

  // Validate limit
  const validLimit = Math.min(Math.max(limit, 1), 200);

  // Get user guilds
  const response = await client["GET /users/@me/guilds"]({
    before,
    after,
    limit: validLimit,
    with_counts: withCounts,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to get user guilds: ${response.statusText}`,
    );
  }

  const guilds = await response.json();
  return guilds;
}

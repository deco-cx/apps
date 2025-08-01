import type { AppContext } from "../mod.ts";
import { DiscordGuild } from "../utils/types.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of guilds to return (1-200, default: 100)
   */
  limit?: number;

  /**
   * @title Before Guild
   * @description Guild ID - return guilds before this ID
   */
  before?: string;

  /**
   * @title After Guild
   * @description Guild ID - return guilds after this ID
   */
  after?: string;

  /**
   * @title Include Counts
   * @description Whether to include approximate member counts
   * @default false
   */
  withCounts?: boolean;
}

/**
 * @title List User Guilds
 * @description List all guilds where the bot is present
 */
export default async function listGuilds(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordGuild[]> {
  const { limit = 100, before, after, withCounts = false } = props;
  const { client } = ctx;

  const validLimit = Math.min(Math.max(limit, 1), 200);

  const response = await client["GET /users/@me/guilds"]({
    limit: validLimit,
    before,
    after,
    with_counts: withCounts,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to list guilds: ${response.statusText}`,
    );
  }

  const guilds = await response.json();
  return guilds;
}

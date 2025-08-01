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
 * @title List Bot Guilds
 * @description List all guilds where the bot is present using Bot Token
 */
export default async function listBotGuilds(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordGuild[]> {
  const { limit = 100, before, after, withCounts = false } = props;
  const { botToken } = ctx;

  if (!botToken) {
    throw new Error("Bot token is required");
  }

  // Validate limit
  const validLimit = Math.min(Math.max(limit, 1), 200);

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set("limit", validLimit.toString());

  if (before) searchParams.set("before", before);
  if (after) searchParams.set("after", after);
  if (withCounts) searchParams.set("with_counts", "true");

  // Make request to Discord API to get bot's guilds
  const response = await fetch(
    `https://discord.com/api/v10/users/@me/guilds?${searchParams}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bot ${botToken}`,
        "Accept": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to list bot guilds: ${response.statusText}`);
  }

  const guilds = await response.json();
  return guilds;
}

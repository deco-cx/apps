import type { AppContext } from "../mod.ts";
import { DiscordChannel } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID to list channels from
   */
  guildId: string;
}

/**
 * @title List Guild Channels
 * @description List all channels from a specific Discord guild using Bot Token
 */
export default async function getGuildChannels(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordChannel[]> {
  const { guildId } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  // Get guild channels
  const response = await client["GET /guilds/:guild_id/channels"]({
    guild_id: guildId,
  });

  if (!response.ok) {
    throw new Error(`Failed to list guild channels: ${response.statusText}`);
  }

  const channels = await response.json();
  return channels;
}

import type { AppContext } from "../mod.ts";
import { DiscordChannel } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID do servidor para listar threads ativas
   */
  guildId: string;
}

export interface ThreadsResponse {
  /**
   * @title Threads
   * @description Lista de threads ativas (inclui posts de forum)
   */
  threads: DiscordChannel[];

  /**
   * @title Members
   * @description Membros das threads
   */
  members: unknown[];

  /**
   * @title Has More
   * @description Se há mais threads disponíveis
   */
  has_more: boolean;
}

/**
 * @title Get Active Threads
 * @description Get all active threads in a Discord server (includes forum posts) using Bot Token
 */
export default async function getActiveThreads(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ThreadsResponse> {
  const { guildId } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  // Get active threads
  const response = await client["GET /guilds/:guild_id/threads/active"]({
    guild_id: guildId,
  });

  if (!response.ok) {
    throw new Error(`Failed to get active threads: ${response.statusText}`);
  }

  const threadsData = await response.json();
  return threadsData;
}

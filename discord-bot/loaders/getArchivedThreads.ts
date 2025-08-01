import type { AppContext } from "../mod.ts";
import { DiscordChannel } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal para listar threads arquivadas
   */
  channelId: string;

  /**
   * @title Type
   * @description Tipo de threads arquivadas (public ou private)
   * @default "public"
   */
  type?: "public" | "private";

  /**
   * @title Before
   * @description Buscar threads antes desta data (ISO8601 timestamp)
   */
  before?: string;

  /**
   * @title Limit
   * @description Número máximo de threads para retornar (máximo 100)
   * @default 50
   */
  limit?: number;
}

export interface ThreadsResponse {
  /**
   * @title Threads
   * @description Lista de threads arquivadas
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
 * @title Get Archived Threads
 * @description Get archived threads from a Discord channel (includes old forum posts) using Bot Token
 */
export default async function getArchivedThreads(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ThreadsResponse> {
  const { channelId, type = "public", before, limit = 50 } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (limit < 1 || limit > 100) {
    throw new Error("Limit must be between 1 and 100");
  }

  // Get archived threads
  const response = await client
    [`GET /channels/:channel_id/threads/archived/${type}`]({
      channel_id: channelId,
      before,
      limit,
    });

  if (!response.ok) {
    throw new Error(`Failed to get archived threads: ${response.statusText}`);
  }

  const threadsData = await response.json();
  return threadsData;
}

import type { AppContext } from "../mod.ts";
import { DiscordMessage } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal Discord para buscar mensagens
   */
  channelId: string;

  /**
   * @title Limit
   * @description Número máximo de mensagens a retornar (1-100, padrão: 50)
   */
  limit?: number;

  /**
   * @title Before
   * @description ID da mensagem - buscar mensagens antes desta
   */
  before?: string;

  /**
   * @title After
   * @description ID da mensagem - buscar mensagens após esta
   */
  after?: string;

  /**
   * @title Around
   * @description ID da mensagem - buscar mensagens ao redor desta
   */
  around?: string;
}

/**
 * @title Get Channel Messages
 * @description Get messages from a Discord channel using Bot Token
 */
export default async function getChannelMessages(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordMessage[]> {
  const { channelId, limit = 50, before, after, around } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  // Validate limit
  const validLimit = Math.min(Math.max(limit, 1), 100);

  // Get channel messages
  const response = await client["GET /channels/:channel_id/messages"]({
    channel_id: channelId,
    limit: validLimit,
    before,
    after,
    around,
  });

  if (!response.ok) {
    throw new Error(`Failed to get channel messages: ${response.statusText}`);
  }

  const messages = await response.json();
  return messages;
}

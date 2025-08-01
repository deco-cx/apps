import type { AppContext } from "../mod.ts";
import { DiscordMessage } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal para listar mensagens fixadas
   */
  channelId: string;
}

/**
 * @title Get Pinned Messages
 * @description Get all pinned messages from a Discord channel using Bot Token
 */
export default async function getPinnedMessages(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordMessage[]> {
  const { channelId } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  // Get pinned messages
  const response = await client["GET /channels/:channel_id/pins"]({
    channel_id: channelId,
  });

  if (!response.ok) {
    throw new Error(`Failed to get pinned messages: ${response.statusText}`);
  }

  const messages = await response.json();
  return messages;
}

import type { AppContext } from "../mod.ts";
import { DiscordMessage } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal onde está a mensagem
   */
  channelId: string;

  /**
   * @title Message ID
   * @description ID da mensagem a ser buscada
   */
  messageId: string;
}

/**
 * @title Get Message
 * @description Get a specific message from a Discord channel using Bot Token
 */
export default async function getMessage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordMessage> {
  const { channelId, messageId } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (!messageId) {
    throw new Error("Message ID is required");
  }

  // Get message
  const response = await client
    ["GET /channels/:channel_id/messages/:message_id"]({
      channel_id: channelId,
      message_id: messageId,
    });

  if (!response.ok) {
    throw new Error(`Failed to get message: ${response.statusText}`);
  }

  const message = await response.json();
  return message;
}

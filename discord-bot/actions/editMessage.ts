import type { AppContext } from "../mod.ts";
import { DiscordMessage, DiscordEmbed } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal onde está a mensagem
   */
  channelId: string;

  /**
   * @title Message ID
   * @description ID da mensagem a ser editada
   */
  messageId: string;

  /**
   * @title Content
   * @description Novo conteúdo da mensagem (máximo 2000 caracteres)
   */
  content?: string;

  /**
   * @title Embeds
   * @description Lista de embeds para incluir na mensagem
   */
  embeds?: DiscordEmbed[];
}

/**
 * @title Edit Message
 * @description Edit a message in a Discord channel using Bot Token
 */
export default async function editMessage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordMessage> {
  const { channelId, messageId, content, embeds } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (!messageId) {
    throw new Error("Message ID is required");
  }

  if (!content && (!embeds || embeds.length === 0)) {
    throw new Error("Message content or embeds are required");
  }

  if (content && content.length > 2000) {
    throw new Error("Message content cannot exceed 2000 characters");
  }

  // Build request body
  const body: any = {};

  if (content) {
    body.content = content;
  }

  if (embeds && embeds.length > 0) {
    body.embeds = embeds;
  }

  // Edit message
  const response = await client["PATCH /channels/:channel_id/messages/:message_id"]({
    channel_id: channelId,
    message_id: messageId,
  }, {
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to edit message: ${response.statusText}`);
  }

  const message = await response.json();
  return message;
}
import type { AppContext } from "../mod.ts";
import {
  DiscordEmbed,
  DiscordMessage,
  EditMessageBody,
} from "../utils/types.ts";

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

  const body: EditMessageBody = {};

  if (content) {
    body.content = content;
  }

  if (embeds && embeds.length > 0) {
    body.embeds = embeds;
  }

  const response = await client
    ["PATCH /channels/:channel_id/messages/:message_id"]({
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

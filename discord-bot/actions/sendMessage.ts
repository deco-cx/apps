import type { AppContext } from "../mod.ts";
import {
  DiscordEmbed,
  DiscordMessage,
  SendMessageBody,
} from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal Discord onde enviar a mensagem
   */
  channelId: string;

  /**
   * @title Content
   * @description Conteúdo da mensagem (máximo 2000 caracteres)
   */
  content?: string;

  /**
   * @title TTS
   * @description Enviar como texto para fala
   * @default false
   */
  tts?: boolean;

  /**
   * @title Embeds
   * @description Lista de embeds para incluir na mensagem
   */
  embeds?: DiscordEmbed[];

  /**
   * @title Reply to Message ID
   * @description ID da mensagem para responder
   */
  replyToMessageId?: string;

  /**
   * @title Reply Mention
   * @description Se deve mencionar o autor da mensagem original na resposta
   * @default false
   */
  replyMention?: boolean;
}

/**
 * @title Send Message
 * @description Send a message to a Discord channel using Bot Token
 */
export default async function sendMessage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordMessage> {
  const {
    channelId,
    content,
    tts = false,
    embeds,
    replyToMessageId,
    replyMention = false,
  } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (!content && (!embeds || embeds.length === 0)) {
    throw new Error("Message content or embeds are required");
  }

  if (content && content.length > 2000) {
    throw new Error("Message content cannot exceed 2000 characters");
  }

  // Build request body
  const body: SendMessageBody = {
    tts,
  };

  if (content) {
    body.content = content;
  }

  if (embeds && embeds.length > 0) {
    body.embeds = embeds;
  }

  // Configure reply if needed
  if (replyToMessageId) {
    body.message_reference = {
      message_id: replyToMessageId,
    };

    body.allowed_mentions = {
      replied_user: replyMention,
    };
  }

  // Send message
  const response = await client["POST /channels/:channel_id/messages"]({
    channel_id: channelId,
  }, {
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  const message = await response.json();
  return message;
}

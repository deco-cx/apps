import type { AppContext } from "../mod.ts";
import { DiscordMessage, DiscordEmbed } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID where to send the message
   */
  channelId: string;

  /**
   * @title Message Content
   * @description Message text (maximum 2000 characters)
   */
  content?: string;

  /**
   * @title Text-to-Speech
   * @description Whether the message should be read by Discord TTS
   * @default false
   */
  tts?: boolean;

  /**
   * @title Embeds
   * @description List of embeds to include in the message
   */
  embeds?: DiscordEmbed[];

  /**
   * @title Reply to Message
   * @description Message ID to reply to
   */
  replyToMessageId?: string;

  /**
   * @title Reply Mention
   * @description Whether to mention the original message author in the reply
   * @default false
   */
  replyMention?: boolean;
}

/**
 * @title Send Message
 * @description Send a message to a Discord channel
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
  const body: any = {
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
      channel_id: channelId,
      fail_if_not_exists: false,
    };

    body.allowed_mentions = {
      replied_user: replyMention,
    };
  }
  console.log("^body", ctx.tokens?.access_token);
  console.log("^channelId", ctx.botToken);
  const teste = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ctx.tokens?.access_token}`,
    },
    body: JSON.stringify(body),
  });

  console.log("^teste", teste);
  console.log("^teste2", await teste.json());

  // Send message
  const response = await client["POST /channels/:channel_id/messages"]({
    channel_id: channelId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to send message: ${response.statusText}`,
    );
  }

  const message = await response.json();
  return message;
} 
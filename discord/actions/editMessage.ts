import type { AppContext } from "../mod.ts";
import { DiscordMessage, DiscordEmbed } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID where the message is located
   */
  channelId: string;

  /**
   * @title Message ID
   * @description ID of the message to be edited
   */
  messageId: string;

  /**
   * @title New Content
   * @description New message text (maximum 2000 characters)
   */
  content?: string;

  /**
   * @title Embeds
   * @description List of embeds to include in the edited message
   */
  embeds?: DiscordEmbed[];
}

/**
 * @title Edit Message
 * @description Edit an existing Discord message (only messages sent by the bot)
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
    throw new Error("New message content or embeds are required");
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
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to edit message: ${response.statusText}`,
    );
  }

  const message = await response.json();
  return message;
} 
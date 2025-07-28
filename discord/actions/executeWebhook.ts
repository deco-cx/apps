import type { AppContext } from "../mod.ts";
import { DiscordMessage, DiscordEmbed } from "../utils/types.ts";

export interface Props {
  /**
   * @title Webhook ID
   * @description ID of the webhook to execute
   */
  webhookId: string;

  /**
   * @title Webhook Token
   * @description Token of the webhook (from webhook URL)
   */
  webhookToken: string;

  /**
   * @title Content
   * @description Message content to send (up to 2000 characters)
   */
  content?: string;

  /**
   * @title Username
   * @description Override the default username of the webhook
   */
  username?: string;

  /**
   * @title Avatar URL
   * @description Override the default avatar of the webhook
   */
  avatarUrl?: string;

  /**
   * @title Text to Speech
   * @description Whether this is a TTS message
   * @default false
   */
  tts?: boolean;

  /**
   * @title Embeds
   * @description Array of embeds to send (up to 10 embeds)
   */
  embeds?: DiscordEmbed[];

  /**
   * @title Wait for Response
   * @description Whether to wait for server confirmation and return message object
   * @default true
   */
  wait?: boolean;

  /**
   * @title Thread ID
   * @description ID of thread to send message to (if webhook is in a forum channel)
   */
  threadId?: string;

  /**
   * @title Thread Name
   * @description Name of thread to create (if webhook is in a forum channel)
   */
  threadName?: string;
}

/**
 * @title Execute Webhook
 * @description Send a message using a Discord webhook
 */
export default async function executeWebhook(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordMessage | void> {
  const {
    webhookId,
    webhookToken,
    content,
    username,
    avatarUrl,
    tts = false,
    embeds,
    wait = true,
    threadId,
    threadName,
  } = props;
  const { client } = ctx;

  if (!webhookId) {
    throw new Error("Webhook ID is required");
  }

  if (!webhookToken) {
    throw new Error("Webhook token is required");
  }

  if (!content && (!embeds || embeds.length === 0)) {
    throw new Error("Either content or embeds must be provided");
  }

  if (content && content.length > 2000) {
    throw new Error("Content cannot exceed 2000 characters");
  }

  if (embeds && embeds.length > 10) {
    throw new Error("Cannot send more than 10 embeds");
  }

  // Build request body
  const body: any = {
    tts,
  };

  if (content) {
    body.content = content;
  }

  if (username) {
    body.username = username;
  }

  if (avatarUrl) {
    body.avatar_url = avatarUrl;
  }

  if (embeds && embeds.length > 0) {
    body.embeds = embeds;
  }

  if (threadName) {
    body.thread_name = threadName;
  }

  // Build search params
  const searchParams: any = {
    wait,
  };

  if (threadId) {
    searchParams.thread_id = threadId;
  }

  // Execute webhook
  const response = await client["POST /webhooks/:webhook_id/:webhook_token"]({
    webhook_id: webhookId,
    webhook_token: webhookToken,
    ...searchParams,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to execute webhook: ${response.statusText}`,
    );
  }

  // If wait is true, return the message object
  if (wait) {
    const message = await response.json();
    return message;
  }
} 
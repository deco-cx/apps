import type { AppContext } from "../mod.ts";
import {
  CreateThreadBody,
  DiscordChannel,
  DiscordEmbed,
} from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID do canal onde criar a thread (pode ser canal de forum)
   */
  channelId: string;

  /**
   * @title Thread Name
   * @description Nome da thread/post
   */
  name: string;

  /**
   * @title Auto Archive Duration
   * @description Tempo para auto-arquivamento em minutos (60, 1440, 4320, 10080)
   * @default 1440
   */
  autoArchiveDuration?: number;

  /**
   * @title Thread Type
   * @description Tipo da thread (11=PUBLIC_THREAD, 12=PRIVATE_THREAD)
   */
  type?: number;

  /**
   * @title Invitable
   * @description Se usuários podem convidar outros para thread privada
   * @default false
   */
  invitable?: boolean;

  /**
   * @title Rate Limit Per User
   * @description Slowmode em segundos (0-21600)
   */
  rateLimitPerUser?: number;

  /**
   * @title Applied Tags
   * @description Tags para aplicar (apenas canais de forum)
   */
  appliedTags?: string[];

  /**
   * @title Initial Message Content
   * @description Mensagem inicial da thread
   */
  messageContent?: string;

  /**
   * @title Initial Message Embeds
   * @description Embeds para mensagem inicial
   */
  messageEmbeds?: DiscordEmbed[];
}

/**
 * @title Create Thread
 * @description Create a thread or forum post in a Discord channel using Bot Token
 */
export default async function createThread(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordChannel> {
  const {
    channelId,
    name,
    autoArchiveDuration = 1440,
    type,
    invitable = false,
    rateLimitPerUser,
    appliedTags,
    messageContent,
    messageEmbeds,
  } = props;
  const { client } = ctx;

  const body: CreateThreadBody = {
    name,
    auto_archive_duration: autoArchiveDuration,
  };

  if (type !== undefined) {
    body.type = type;
  }

  if (invitable !== undefined) {
    body.invitable = invitable;
  }

  if (rateLimitPerUser !== undefined) {
    body.rate_limit_per_user = rateLimitPerUser;
  }

  if (appliedTags && appliedTags.length > 0) {
    body.applied_tags = appliedTags;
  }

  // Add initial message if provided
  if (messageContent || (messageEmbeds && messageEmbeds.length > 0)) {
    body.message = {};

    if (messageContent) {
      body.message.content = messageContent;
    }

    if (messageEmbeds && messageEmbeds.length > 0) {
      body.message.embeds = messageEmbeds;
    }
  }

  const response = await client["POST /channels/:channel_id/threads"]({
    channel_id: channelId,
  }, {
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to create thread: ${response.statusText}`);
  }

  const thread = await response.json();
  return thread;
}

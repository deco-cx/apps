import type { AppContext } from "../mod.ts";
import {
  DiscordEmbed,
  DiscordMessage,
  ExecuteWebhookBody,
} from "../utils/types.ts";

export interface Props {
  /**
   * @title Webhook ID
   * @description ID do webhook
   */
  webhookId: string;

  /**
   * @title Webhook Token
   * @description Token do webhook
   */
  webhookToken: string;

  /**
   * @title Content
   * @description Conteúdo da mensagem (máximo 2000 caracteres)
   */
  content?: string;

  /**
   * @title Username
   * @description Nome de usuário personalizado para o webhook
   */
  username?: string;

  /**
   * @title Avatar URL
   * @description URL do avatar personalizado para o webhook
   */
  avatarUrl?: string;

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
   * @title Wait
   * @description Aguardar retorno da mensagem criada
   * @default true
   */
  wait?: boolean;

  /**
   * @title Thread ID
   * @description ID da thread para enviar a mensagem
   */
  threadId?: string;

  /**
   * @title Thread Name
   * @description Nome da thread a ser criada (apenas para canais de forum)
   */
  threadName?: string;

  /**
   * @title Applied Tags
   * @description Tags para aplicar (apenas canais de forum)
   */
  appliedTags?: string[];
}

/**
 * @title Execute Webhook
 * @description Send a message through a Discord webhook
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
    appliedTags,
  } = props;
  const { client } = ctx;

  const body: ExecuteWebhookBody = {
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

  if (appliedTags && appliedTags.length > 0) {
    body.applied_tags = appliedTags;
  }

  const response = await client["POST /webhooks/:webhook_id/:webhook_token"]({
    webhook_id: webhookId,
    webhook_token: webhookToken,
    wait,
    thread_id: threadId,
  }, {
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to execute webhook: ${response.statusText}`);
  }

  if (wait) {
    return await response.json();
  }
}

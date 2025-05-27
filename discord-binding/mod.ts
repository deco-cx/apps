import type { FnContext } from "@deco/deco";
import {
  InputBindingProps,
  OutputBindingProps,
  processStream,
  StreamOptions,
} from "../mcp/bindings.ts";
import { McpContext } from "../mcp/context.ts";
import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";
import type { DiscordClient, DiscordWebhookPayload } from "./client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

// Type for OAuth tokens (compatible with Google Sheets and MCP)
type OAuthTokens = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  tokenObtainedAt?: number;
};

export interface Metadata extends Record<string, unknown> {
  applicationId: string;
  token: string;
}

// Discord OAuth provider definition
const DiscordProvider = {
  name: "Discord",
  authUrl: "https://discord.com/api/oauth2/authorize",
  tokenUrl: "https://discord.com/api",
  scopes: ["identify", "guilds", "webhook.incoming"],
  clientId: "",
  clientSecret: "",
};

export interface ChannelWebhook {
  webhookId: string;
  webhookToken: string;
}
export interface Props {
  tokens?: OAuthTokens;
  clientSecret?: string;
  clientId?: string;
  webhookPublicKey: string;
  webhook?: ChannelWebhook;
}

export interface State extends Props {
  client: ReturnType<typeof createOAuthHttpClient<DiscordClient>>;
  handle: (
    props:
      | InputBindingProps<DiscordWebhookPayload>
      | OutputBindingProps<Metadata>,
    req: Request,
    ctx: AppContext,
  ) => Promise<void>;
  /**
   * Send a message to a Discord webhook based on a DiscordWebhookPayload
   */
  sendDiscordMessage: (
    payload: ChannelWebhook,
    content: string,
    options?: { username?: string; avatar_url?: string; embeds?: unknown[] },
  ) => Promise<Response>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Discord-Bot
 * @description MCP binding for Discord with OAuth 2.0 and webhook signature validation
 * @category Integrations
 * @logo https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/discord.svg
 */
export default function App(
  props: Props,
  _req: Request,
  ctx?: McpContext<Props>,
) {
  const { tokens, clientId, clientSecret, webhookPublicKey, webhook } = props;

  const discordProvider = {
    ...DiscordProvider,
    clientId: clientId ?? "",
    clientSecret: clientSecret ?? "",
  };

  const client = createOAuthHttpClient<DiscordClient>({
    provider: discordProvider,
    apiBaseUrl: "https://discord.com/api/v10",
    tokens,
    onTokenRefresh: async (newTokens) => {
      if (ctx) {
        await ctx.configure({
          ...ctx,
          tokens: newTokens,
          webhookPublicKey: webhookPublicKey,
          clientId: clientId,
          clientSecret: clientSecret,
        });
      }
    },
  });

  const state: State = {
    ...props,
    tokens,
    client,
    handle: (
      props:
        | InputBindingProps<DiscordWebhookPayload>
        | OutputBindingProps<Metadata>,
      _req: Request,
      ctx: AppContext,
    ) => {
      let args: StreamOptions | undefined;
      let payload: DiscordWebhookPayload | undefined;
      let textBuffer = "";
      let content = "";
      if ("payload" in props) {
        payload = props.payload;
        // Try to extract the message from Discord interaction payloads
        if (
          payload.data && payload.data.options &&
          payload.data.options[0]?.value
        ) {
          content = payload.data.options[0].value;
        } else if (payload.message && payload.message.content) {
          content = payload.message.content;
        } else if (payload.data && payload.data.custom_id) {
          content = payload.data.custom_id;
        } else if (payload.message) {
          content = JSON.stringify(payload.message);
        } else {
          content = JSON.stringify(payload);
        }
        args = {
          messages: [{
            id: payload.id,
            role: "user",
            content,
          }],
          options: {
            threadId: payload.channel_id,
            resourceId: payload.guild_id,
            metadata: {
              applicationId: payload.application_id,
              token: payload.token,
            },
          },
        };
      }
      return processStream({
        streamProps: args,
        onTextPart: (part) => {
          textBuffer += part;
        },
        onFinishMessagePart: async () => {
          const channelWebhook = payload?.application_id && payload?.token
            ? { webhookId: payload.application_id, webhookToken: payload.token }
            : "metadata" in props && props.metadata
            ? {
              webhookId: props.metadata.applicationId,
              webhookToken: props.metadata.token,
            }
            : webhook;
          if (channelWebhook && textBuffer.trim()) {
            await ctx.sendDiscordMessage(channelWebhook, textBuffer);
          }
          textBuffer = "";
        },
        onDataPart: (part) => {
          console.log("data part", part);
        },
        onFilePart: (part) => {
          console.log("file part", part);
        },
        onSourcePart: (part) => {
          console.log("source part", part);
        },
        onErrorPart: (part) => {
          console.log("error part", part);
        },
        onToolCallStreamingStartPart: (part) => {
          console.log("tool call streaming start part", part);
        },
        onToolCallDeltaPart: (part) => {
          console.log("tool call delta part", part);
        },
        onFinishStepPart: (part) => {
          console.log("finish step part", part);
        },
        onStartStepPart: (part) => {
          console.log("start step part", part);
        },
        onReasoningSignaturePart: (part) => {
          console.log("reasoning signature part", part);
        },
        onRedactedReasoningPart: (part) => {
          console.log("redacted reasoning part", part);
        },
        onReasoningPart: (part) => {
          console.log("reasoning part", part);
        },
        onToolCallPart: (part) => {
          console.log("tool call part", part);
        },
        onToolResultPart: (part) => {
          console.log("tool result part", part);
        },
        onMessageAnnotationsPart: (part) => {
          console.log("message annotations part", part);
        },
      }, props.callbacks.stream);
    },
    sendDiscordMessage: (
      payload,
      content,
      options = {},
    ) => {
      // Discord webhooks use application_id as webhookId and token as webhookToken
      const webhookId = payload.webhookId;
      const webhookToken = payload.webhookToken;
      if (!webhookId || !webhookToken) {
        throw new Error("Missing application_id or token in payload");
      }
      return state.client["POST /webhooks/:webhookId/:webhookToken"](
        { webhookId, webhookToken },
        { body: { content, ...options } },
      );
    },
  };

  return {
    state,
    manifest,
  };
}

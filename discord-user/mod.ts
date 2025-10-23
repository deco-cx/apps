import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import {
  API_URL,
  DISCORD_ERROR_MESSAGES,
  OAUTH_URL,
  OAUTH_URL_AUTH,
  SCOPES,
} from "./utils/constant.ts";
import { Client } from "./utils/client.ts";
import {
  DEFAULT_OAUTH_HEADERS,
  OAuthClientOptions,
  OAuthClients,
  OAuthProvider,
  OAuthTokens,
} from "../mcp/oauth.ts";
import {
  createErrorHandler,
  ErrorHandler,
} from "../mcp/utils/errorHandling.ts";

export const DiscordProvider: OAuthProvider = {
  name: "Discord",
  authUrl: OAUTH_URL_AUTH,
  tokenUrl: OAUTH_URL,
  scopes: SCOPES,
  clientId: "",
  clientSecret: "",
};

// Simple auth client interface for Discord
export interface DiscordAuthClient {
  "POST /oauth2/token": {
    response: {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      scope: string;
    };
    body: Record<string, string>;
  };
}

export interface Props {
  /**
   * @title OAuth Tokens
   * @description OAuth tokens for user-based operations
   */
  tokens?: OAuthTokens;

  /**
   * @title Client Secret
   * @description Client Secret from Discord Developer Portal (required for OAuth)
   */
  clientSecret?: string;

  /**
   * @title Client ID
   * @description Client ID from Discord Developer Portal (required for OAuth)
   */
  clientId?: string;
}

export interface State extends Props {
  client: OAuthClients<Client, DiscordAuthClient>;
  errorHandler: ErrorHandler;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Discord User
 * @appName discorduser
 * @description Integração Discord com OAuth para usuários - ler mensagens, enviar mensagens e gerenciar dados pessoais
 * @category Comunicação
 * @logo https://support.discord.com/hc/user_images/PRywUXcqg0v5DD6s7C3LyQ.jpeg
 */
export default function App(
  props: Props,
  _req: Request,
  ctx?: McpContext<Props>,
) {
  const { tokens, clientId, clientSecret } = props;

  const discordProvider: OAuthProvider = {
    ...DiscordProvider,
    clientId: clientId ?? "",
    clientSecret: clientSecret ?? "",
  };

  const options: OAuthClientOptions = {
    headers: {
      ...DEFAULT_OAUTH_HEADERS,
    },
    authClientConfig: {
      headers: new Headers({
        "Accept": "application/json",
        "Content-Type": "application/json",
      }),
    },
    apiClientConfig: {
      headers: new Headers({
        ...(tokens && { "Authorization": `Bearer ${tokens.access_token}` }),
      }),
    },
  };

  const client = createOAuthHttpClient<Client, DiscordAuthClient>({
    provider: discordProvider,
    apiBaseUrl: API_URL,
    tokens,
    options,
    onTokenRefresh: async (newTokens: OAuthTokens) => {
      if (ctx) {
        await ctx.configure({
          ...ctx,
          tokens: newTokens,
        });
      }
    },
    customRefreshFunction: async (tokens: {
      refresh_token: string;
      client_id: string;
      client_secret: string;
    }) => {
      if (!tokens.refresh_token || tokens.refresh_token.length < 20) {
        throw new Error("Refresh token appears to be invalid or too short");
      }

      const requestBody = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
      });

      const authHeader = `Basic ${
        btoa(`${tokens.client_id}:${tokens.client_secret}`)
      }`;

      const response = await fetch(OAUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": authHeader,
        },
        body: requestBody,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Refresh token failed:", data);

        if (data.error === "invalid_grant") {
          throw new Error(
            "REFRESH_TOKEN_EXPIRED: The refresh token has expired or is invalid. User needs to re-authorize the application.",
          );
        }

        throw new Error(`Refresh token failed: ${JSON.stringify(data)}`);
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        scope: data.scope,
        token_type: data.token_type,
      };
    },
  });

  const errorHandler = createErrorHandler({
    errorMessages: DISCORD_ERROR_MESSAGES,
    defaultErrorMessage: "Discord operation failed",
  });

  const state: State = {
    ...props,
    tokens,
    client,
    errorHandler,
  };

  return {
    state,
    manifest,
  };
}

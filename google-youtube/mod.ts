import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import {
  API_URL,
  OAUTH_URL,
  OAUTH_URL_AUTH,
  SCOPES,
  YOUTUBE_ERROR_MESSAGES,
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
import { GoogleAuthClient } from "../mcp/utils/google/authClient.ts";

export const YoutubeProvider: OAuthProvider = {
  name: "YouTube",
  authUrl: OAUTH_URL_AUTH,
  tokenUrl: OAUTH_URL,
  scopes: SCOPES,
  clientId: "",
  clientSecret: "",
};

export interface Props {
  tokens?: OAuthTokens;
  clientSecret?: string;
  clientId?: string;
}

export interface State extends Props {
  client: OAuthClients<Client, GoogleAuthClient>;
  errorHandler: ErrorHandler;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title YouTube
 * @description Integração com YouTube usando OAuth 2.0 com refresh automático de tokens
 * @category Social
 * @logo https://cdn.pixabay.com/photo/2021/09/11/18/21/youtube-6616310_1280.png
 */
export default function App(
  props: Props,
  _req: Request,
  ctx?: McpContext<Props>,
) {
  const { tokens, clientId, clientSecret } = props;

  const youtubeProvider: OAuthProvider = {
    ...YoutubeProvider,
    clientId: clientId ?? "",
    clientSecret: clientSecret ?? "",
  };

  const options: OAuthClientOptions = {
    headers: DEFAULT_OAUTH_HEADERS,
    authClientConfig: {
      headers: new Headers({
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      }),
    },
  };

  const client = createOAuthHttpClient<Client, GoogleAuthClient>({
    provider: youtubeProvider,
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
  });

  const errorHandler = createErrorHandler({
    errorMessages: YOUTUBE_ERROR_MESSAGES,
    defaultErrorMessage: "YouTube operation failed",
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

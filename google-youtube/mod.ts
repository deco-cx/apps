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
import {
  createGoogleOAuthUserInfoClient,
  GoogleUserInfoClient,
} from "../mcp/utils/google/userInfo.ts";

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
  userInfoClient: GoogleUserInfoClient;
  errorHandler: ErrorHandler;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title YouTube
 * @appName google-youtube
 * @description Search and retrieve videos, playlists, and channels.
 * @category Social
 * @logo https://assets.decocache.com/mcp/cac50532-150e-437d-a996-91fd9a0c115e/YouTube.svg
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

  const userInfoClient = createGoogleOAuthUserInfoClient({
    provider: youtubeProvider,
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
    userInfoClient,
    errorHandler,
  };

  return {
    state,
    manifest,
  };
}

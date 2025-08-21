import type { FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { AuthClient, Client } from "./utils/client.ts";
import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";
import { McpContext } from "./mcp/context.ts";
import {
  API_URL,
  OAUTH_URL,
  OAUTH_URL_AUTH,
  SCOPES,
} from "./utils/constant.ts";
import {
  DEFAULT_OAUTH_HEADERS,
  OAuthClientOptions,
  OAuthClients,
  OAuthProvider,
  OAuthTokens,
} from "../mcp/oauth.ts";
import {
  createGoogleOAuthUserInfoClient,
  GoogleUserInfoClient,
} from "../mcp/utils/google/userInfo.ts";

export const GoogleProvider: OAuthProvider = {
  name: "Google",
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
  client: OAuthClients<Client, AuthClient>;
  userInfoClient: GoogleUserInfoClient;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;
/**
 * @title Google Slides
 * @appName google-slides
 * @description Create and manage Google Slides presentations
 * @category Content Management
 * @logo https://www.gstatic.com/images/branding/product/1x/slides_48dp.png
 */
export default function App(
  props: Props,
  _req: Request,
  ctx?: McpContext<Props>,
) {
  const { tokens, clientId, clientSecret } = props;

  const googleProvider: OAuthProvider = {
    ...GoogleProvider,
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

  const client = createOAuthHttpClient<Client, AuthClient>({
    provider: googleProvider,
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
    provider: googleProvider,
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

  const state: State = {
    ...props,
    tokens,
    client,
    userInfoClient,
  };

  return {
    state,
    manifest,
  };
}

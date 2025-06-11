import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import {
  API_URL,
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
  createGoogleOAuthUserInfoClient,
  GoogleUserInfoClient,
} from "../mcp/utils/google/userInfo.ts";
import { GoogleAuthClient } from "../mcp/utils/google/authClient.ts";

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
  client: OAuthClients<Client, GoogleAuthClient>;
  userInfoClient: GoogleUserInfoClient;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Google Gmail
 * @description Integração com Google Gmail usando OAuth 2.0 com refresh automático de tokens
 * @category Produtividade
 * @logo https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/1024px-Gmail_icon_%282020%29.svg.png
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

  const client = createOAuthHttpClient<Client, GoogleAuthClient>({
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

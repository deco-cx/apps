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
import { AuthClient, FigmaClient } from "./utils/client.ts";
import {
  DEFAULT_OAUTH_HEADERS,
  OAuthClientOptions,
  OAuthClients,
  OAuthProvider,
  OAuthTokens,
} from "../mcp/oauth.ts";

export const FigmaProvider: OAuthProvider = {
  name: "Figma",
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
  client: OAuthClients<FigmaClient, AuthClient>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Figma
 * @description Integração com Figma usando OAuth 2.0 com refresh automático de tokens
 * @category Design
 * @logo https://assets.decocache.com/mcp/eb714f8a-404b-4b8e-bfc4-f3ce5bde6f51/Figma.svg
 */
export default function App(
  props: Props,
  _req: Request,
  ctx?: McpContext<Props>,
) {
  const { tokens, clientId, clientSecret } = props;

  const figmaProvider: OAuthProvider = {
    ...FigmaProvider,
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

  const client = createOAuthHttpClient<FigmaClient, AuthClient>({
    provider: figmaProvider,
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

  const state: State = {
    ...props,
    tokens,
    client,
  };

  return {
    state,
    manifest,
  };
}

// Re-exports client types for convenience
export * from "./utils/client.ts";

import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import {
  AIRTABLE_API_BASE_URL,
  OAUTH_SCOPES,
  OAUTH_URL_AUTH,
  OAUTH_URL_TOKEN,
} from "./utils/constants.ts";
import { AirtableClient } from "./utils/client.ts";
import {
  DEFAULT_OAUTH_HEADERS,
  OAuthClientOptions,
  OAuthClients,
  OAuthProvider,
  OAuthTokens,
} from "../mcp/oauth.ts";

export const AirtableProvider: OAuthProvider = {
  name: "Airtable",
  authUrl: OAUTH_URL_AUTH,
  tokenUrl: OAUTH_URL_TOKEN,
  scopes: OAUTH_SCOPES,
  clientId: "",
  clientSecret: "",
};

export interface Props {
  /**
   * @title OAuth Tokens
   * @description OAuth tokens for authenticated requests
   */
  tokens?: OAuthTokens;

  /**
   * @title OAuth Client Secret
   * @description OAuth client secret for authentication
   */
  clientSecret?: string;

  /**
   * @title OAuth Client ID
   * @description OAuth client ID for authentication
   */
  clientId?: string;
}

export interface State extends Props {
  client: OAuthClients<AirtableClient, AirtableClient>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Airtable
 * @description Connect to Airtable bases and manage records, tables, and fields with OAuth 2.0 support
 * @category Productivity
 * @logo https://static-00.iconduck.com/assets.00/airtable-icon-512x428-olxouyvv.png
 */
export default function App(
  props: Props,
  _req: Request,
  ctx?: McpContext<Props>,
) {
  const { tokens, clientId, clientSecret } = props;

  const airtableProvider: OAuthProvider = {
    ...AirtableProvider,
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

  const client = createOAuthHttpClient<AirtableClient, AirtableClient>({
    provider: airtableProvider,
    apiBaseUrl: AIRTABLE_API_BASE_URL,
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
    client,
  };

  return {
    state,
    manifest,
  };
}

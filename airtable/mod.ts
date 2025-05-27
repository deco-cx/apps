import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { App, FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import {
  AIRTABLE_API_BASE_URL,
  OAUTH_SCOPES,
  OAUTH_URL_AUTH,
  OAUTH_URL_TOKEN,
} from "./utils/constants.ts";
import { AirtableClient } from "./utils/client.ts";
import type { Secret } from "../website/loaders/secret.ts";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
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
   * @title Airtable API Key (optional if using OAuth)
   * @description The API key for accessing your Airtable account.
   * @format password
   */
  apiKey?: string | Secret;

  /**
   * @title Airtable Base URL
   * @description The base URL for the Airtable API.
   * @default https://api.airtable.com
   */
  baseUrl?: string;

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
  api: (apiKey: string) => ReturnType<typeof createHttpClient<AirtableClient>>;
  apiKey: string;
  baseUrl: string;
  client?: OAuthClients<AirtableClient, AirtableClient>;
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
): App<Manifest, State> {
  const { tokens, clientId, clientSecret } = props;
  const resolvedApiKey = props.apiKey
    ? (typeof props.apiKey === "string" ? props.apiKey : props.apiKey.get())
    : "";
  const resolvedBaseUrl = props.baseUrl || AIRTABLE_API_BASE_URL;

  const createClientWithHeaders = (headers: Headers) => {
    return createHttpClient<AirtableClient>({
      base: resolvedBaseUrl,
      fetcher: fetchSafe,
      headers,
    });
  };

  const api = (apiKey: string) => {
    const authToken = tokens?.access_token || apiKey;
    return createClientWithHeaders(
      new Headers({
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
      }),
    );
  };

  // OAuth client setup if tokens are provided
  let oauthClient: OAuthClients<AirtableClient, AirtableClient> | undefined;

  if (tokens && clientId && clientSecret) {
    const airtableProvider: OAuthProvider = {
      ...AirtableProvider,
      clientId: clientId,
      clientSecret: clientSecret,
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

    oauthClient = createOAuthHttpClient<AirtableClient, AirtableClient>({
      provider: airtableProvider,
      apiBaseUrl: resolvedBaseUrl,
      tokens,
      options,
      onTokenRefresh: async (newTokens: OAuthTokens) => {
        if (ctx) {
          await ctx.configure({
            ...props,
            tokens: newTokens,
          });
        }
      },
    });
  }

  const state: State = {
    ...props,
    api,
    apiKey: resolvedApiKey || "",
    baseUrl: resolvedBaseUrl,
    client: oauthClient,
  };

  return {
    state,
    manifest,
  };
}

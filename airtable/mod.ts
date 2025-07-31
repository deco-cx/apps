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
import type { Permission } from "./utils/types.ts";

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

  /**
   * @title Permission
   * @description Permission to access the Airtable API and selected bases and tables
   */
  permission: Permission;
}

export interface State extends Props {
  client: OAuthClients<AirtableClient, AirtableClient>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Airtable
 * @appName airtable
 * @description Access and manage data from Airtable bases, tables, and records.
 * @category Productivity
 * @logo https://assets.decocache.com/mcp/e724f447-3b98-46c4-9194-6b79841305a2/Airtable.svg
 */
export default function App(
  props: Props,
  _req: Request,
  ctx: AppContext,
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
    customRefreshFunction: async (params: {
      refresh_token: string;
      client_id: string;
      client_secret: string;
    }) => {
      const response = await fetch(OAUTH_URL_TOKEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "Authorization": `Basic ${
            btoa(`${params.client_id}:${params.client_secret}`)
          }`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: params.refresh_token,
          client_id: params.client_id,
          client_secret: params.client_secret,
        }),
      });

      return response.json();
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

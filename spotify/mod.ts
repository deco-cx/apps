import type { App, FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";

import {
  SPOTIFY_API_BASE_URL,
  SPOTIFY_OAUTH_AUTHORIZE_URL,
  SPOTIFY_OAUTH_TOKEN_URL,
  SPOTIFY_SCOPES,
} from "./utils/constants.ts";
import { AuthClient, SpotifyClient } from "./client.ts";
import {
  DEFAULT_OAUTH_HEADERS,
  OAuthClientOptions,
  OAuthClients,
  OAuthProvider,
  OAuthTokens,
} from "../mcp/oauth.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export const SpotifyProvider: OAuthProvider = {
  name: "Spotify",
  authUrl: SPOTIFY_OAUTH_AUTHORIZE_URL,
  tokenUrl: SPOTIFY_OAUTH_TOKEN_URL,
  scopes: SPOTIFY_SCOPES,
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
  client: OAuthClients<SpotifyClient, AuthClient>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Spotify
 * @appName spotify
 * @description Search and retrieve music, albums, artists, and playlists.
 * @category Music
 * @logo https://assets.decocache.com/mcp/18f88493-1165-40a8-b165-31d15a367f16/Spotify.svg
 */
export default function App(
  props: Props,
  _req: Request,
  ctx?: McpContext<Props>,
): App<Manifest, State> {
  const { tokens, clientId, clientSecret } = props;

  const spotifyProvider: OAuthProvider = {
    ...SpotifyProvider,
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

  const client = createOAuthHttpClient<SpotifyClient, AuthClient>({
    provider: spotifyProvider,
    apiBaseUrl: SPOTIFY_API_BASE_URL,
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

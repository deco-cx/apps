import type { App, FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import { SPOTIFY_API_BASE_URL } from "./utils/constants.ts";
import { SpotifyClient } from "./client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface Props {
  /**
   * @title Client ID
   * @description Spotify application client ID. If not provided, will use SPOTIFY_CLIENT_ID from environment.
   */
  clientId?: string;

  /**
   * @title Client Secret
   * @description Spotify application client secret. If not provided, will use SPOTIFY_CLIENT_SECRET from environment.
   */
  clientSecret?: string | Secret;

  /**
   * @title Access Token
   * @description Spotify OAuth2 access token
   */
  accessToken?: string | Secret;

  /**
   * @title Refresh Token
   * @description Spotify OAuth2 refresh token
   */
  refreshToken?: string | Secret;

  /**
   * @title Scope
   * @description OAuth2 permission scopes
   */
  scope?: string;

  /**
   * @title Token Type
   * @description Token type (usually "Bearer")
   */
  tokenType?: string;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<SpotifyClient>>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Spotify
 * @description Integration with the Spotify Web API for music, playlists, playback control, and more
 * @category Music
 * @logo https://s3-alpha.figma.com/hub/file/2734964093/9f5edc36-eb4d-414a-8447-10514f2bc224-cover.png
 */
export default function App(props: Props): App<Manifest, State> {
  const {
    accessToken,
    clientId = Deno.env.get("SPOTIFY_CLIENT_ID"),
    clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET"),
    refreshToken,
    scope,
    tokenType = "Bearer",
  } = props;

  // Resolve string or Secret tokens
  const finalAccessToken = typeof accessToken === "string"
    ? accessToken
    : accessToken?.get?.() ?? "";

  const finalClientSecret = typeof clientSecret === "string"
    ? clientSecret
    : clientSecret?.get?.() ?? "";

  const finalRefreshToken = typeof refreshToken === "string"
    ? refreshToken
    : refreshToken?.get?.() ?? "";

  const api = createHttpClient<SpotifyClient>({
    base: SPOTIFY_API_BASE_URL,
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(finalAccessToken
        ? {
          "Authorization": `${tokenType} ${finalAccessToken}`,
        }
        : {}),
    }),
    fetcher: fetchSafe,
  });

  const state: State = {
    ...props,
    api,
    clientId: clientId || "",
    clientSecret: finalClientSecret,
    accessToken: finalAccessToken,
    refreshToken: finalRefreshToken,
    scope,
    tokenType,
  };

  return {
    state,
    manifest,
  };
}

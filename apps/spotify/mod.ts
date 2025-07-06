import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../../utils/fetch.ts";
import { createHttpClient } from "../../utils/http.ts";
import type { Secret } from "../../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { SpotifyClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Access Token
   * @description The Spotify access token for API requests
   */
  accessToken?: string | Secret;

  /**
   * @title Client ID
   * @description The Spotify client ID for your application
   */
  clientId?: string;

  /**
   * @title Client Secret
   * @description The Spotify client secret for your application
   */
  clientSecret?: string | Secret;
}

export interface State {
  clientId?: string;
  api: ReturnType<typeof createHttpClient<SpotifyClient>>;
}

/**
 * @name Spotify
 * @description Integrate with Spotify Web API to manage playlists, player, and user data
 * @category Music
 * @logo ./logo.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { accessToken, clientId, clientSecret } = props;

  const token = typeof accessToken === "string" 
    ? accessToken 
    : accessToken?.get?.() ?? "";

  const secret = typeof clientSecret === "string"
    ? clientSecret
    : clientSecret?.get?.() ?? "";

  const api = createHttpClient<SpotifyClient>({
    base: "https://api.spotify.com/v1",
    headers: new Headers({
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const state = {
    clientId,
    api,
  };

  return {
    state,
    manifest,
  };
}
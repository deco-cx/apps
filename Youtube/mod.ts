import type { AuthClient, Client } from "./utils/client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { Secret } from "../website/loaders/secret.ts";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";

export interface Props {
  /**
   * @title Authentication Configuration
   * @description The configuration for the authentication on the Youtube API.
   */
  authenticationConfig: {
    clientSecret: Secret;
    clientId: string;
    scopes: string;
    redirectUri: string;
    /**
     * @title Authentication URL
     * @description The URL to authenticate the user ex: https://accounts.google.com/o/oauth2/v2/auth
     */
    url: string;
  };
}

export interface State extends Props {
  client: ReturnType<typeof createHttpClient<Client>>;
  authClient: ReturnType<typeof createHttpClient<AuthClient>>;
}

export type AppContext = FnContext<State, Manifest>;

/**
 * @title Youtube
 * @description Loaders, actions and authentication for the Youtube API for Deco.
 * @category Social
 * @logo https://cdn.pixabay.com/photo/2021/09/11/18/21/youtube-6616310_1280.png
 */
export default function App({ ...props }: Props) {
  const client = createHttpClient<Client>({
    base: "https://www.googleapis.com/youtube/v3",
    headers: new Headers({
      "Accept": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const authClient = createHttpClient<AuthClient>({
    base: "https://oauth2.googleapis.com",
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    }),
    fetcher: fetchSafe,
  });

  const state = {
    ...props,
    client,
    authClient,
  };

  return {
    state,
    manifest,
  };
}

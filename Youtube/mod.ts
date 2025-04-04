import type { YoutubeClient } from "./utils/client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { Secret } from "../website/loaders/secret.ts";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";

interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface Props {
  apiConfig: {
    clientIdSecret?: Secret;
    scopes?: string;
    redirectUri?: string;
  };
}

export interface State extends Props {
  client: ReturnType<typeof createHttpClient<YoutubeClient>>;
}

export type AppContext = FnContext<State, Manifest>;

export default function App(props: Props) {
  const client = createHttpClient<YoutubeClient>({
    base: "https://www.googleapis.com/youtube/v3",
    headers: new Headers({
      "Accept": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const state = {
    ...props,
    client,
    apiConfig: {
      clientId: props.apiConfig.clientIdSecret,
      scopes: props.apiConfig.scopes,
      redirectUri: props.apiConfig.redirectUri,
    },
  };

  return {
    state,
    manifest,
  };
}

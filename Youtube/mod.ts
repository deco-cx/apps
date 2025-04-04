import type { YoutubeClient } from "./utils/client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { App, FnContext } from "@deco/deco";
import { Secret } from "../website/loaders/secret.ts";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";

interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface Props {
  apiKey?: Secret;
  channelId?: Secret;
  youtubeClientId?: Secret;
  youtubeClientSecret?: Secret;
  youtubeRedirectUri?: Secret;
}

export interface State extends Omit<Props, "apiKey"> {
  api: ReturnType<typeof createHttpClient<YoutubeClient>>;
}

export type AppContext = FnContext<State, Manifest>;

export default function App(props: Props) {
  const apiKey = typeof props.apiKey === "string"
    ? props.apiKey
    : props.apiKey?.get?.() ?? "";
  const client = createHttpClient<YoutubeClient>({
    base: "https://www.googleapis.com/youtube/v3",
    headers: new Headers({
      "Accept": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const state = { ...props, api: client, apiKey };

  return {
    state,
    manifest,
  };
}

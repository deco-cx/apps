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
  accessToken?: Secret;
  config: OAuthCredentials
}

export interface State extends Omit<Props, "accessToken"> {
  api: ReturnType<typeof createHttpClient<YoutubeClient>>;
}

export type AppContext = FnContext<State, Manifest>;

export default function App(props: Props) {
  const { accessToken } = props;
  const _accessToken = typeof accessToken === "string" ? accessToken : accessToken?.get?.() ?? "";

  const api = createHttpClient<YoutubeClient>({
    base: "https://www.googleapis.com/youtube/v3",
    headers: new Headers({
      "Authorization": `Bearer ${_accessToken}`,
      "Accept": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const state = { ...props, api };

  return {
    state,
    manifest,
  };
}

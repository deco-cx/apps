import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { ViduClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Vidu API Key
   * @description The API key for accessing the Vidu API.
   * @format password
   */
  apiKey: string | Secret;
}

export interface State {
  api: ReturnType<typeof createHttpClient<ViduClient>>;
}

/**
 * @title Vidu
 * @description An app for interacting with the Vidu Image to Video API.
 * @category AI & Generative
 * @logo https://asset.swimm.io/Users/user-l0dshhh3e7f6y2y2/logo-vidu.png?א=0
 */
export default function App(
  props: Props,
): App<Manifest, State> {
  const { apiKey } = props;
  const stringToken = typeof apiKey === "string"
    ? apiKey
    : apiKey.get?.() ?? "";

  const api = createHttpClient<ViduClient>({
    base: `https://api.vidu.com`,
    headers: new Headers({
      "Authorization": `Token ${stringToken}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const state = { api };

  return {
    state,
    manifest,
  };
}

export type ViduApp = ReturnType<typeof App>;

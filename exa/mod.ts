import type { App, FnContext } from "@deco/deco";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { ExaClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title API Key
   * @description Exa API key required for authentication
   */
  apiKey: string | Secret;

  /**
   * @title Base URL
   * @description Base URL for Exa API
   * @default https://api.exa.ai
   */
  baseUrl?: string;
}

export interface State {
  api: ReturnType<typeof createHttpClient<ExaClient>>;
  apiKey: string;
  baseUrl: string;
}

/**
 * @title Exa AI
 * @description Search the web, Linkedin, and company websites using Exa AI
 * @category AI Tools
 * @logo https://bookface-images.s3.amazonaws.com/small_logos/9a54e5c11b9f296fb3be7980c9aaaf6ddd2f0c8c.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { apiKey } = props;
  const baseUrl = props.baseUrl || "https://api.exa.ai";

  const _apiKey = typeof apiKey === "string" ? apiKey : apiKey?.get?.() ?? "";

  const api = createHttpClient<ExaClient>({
    base: baseUrl,
    headers: new Headers({
      "accept": "application/json",
      "content-type": "application/json",
      "x-api-key": _apiKey,
    }),
    fetcher: fetchSafe,
  });

  const state: State = {
    api,
    apiKey: _apiKey,
    baseUrl,
  };

  return {
    state,
    manifest,
  };
}

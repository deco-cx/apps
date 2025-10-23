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
 * @appName exa
 * @description Run semantic web searches powered by Exa’s intelligent retrieval.
 * @category AI Tools
 * @logo https://assets.decocache.com/mcp/e71a6d5a-81e1-486d-91f9-8f950c8b9f91/ExaAI.svg
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

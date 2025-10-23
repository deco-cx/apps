import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { TinyClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

/**
 * Props for the Tiny ERP app
 */
export interface Props {
  /**
   * @title API Token
   * @description The Bearer token for the Tiny API
   */
  token: string | Secret;

  /**
   * @title Base URL
   * @description The base URL for the Tiny API
   * @default https://api.tiny.com.br/public-api/v3
   */
  baseUrl?: string;
}

/**
 * State maintained and passed to all loaders and actions
 */
export interface State {
  api: ReturnType<typeof createHttpClient<TinyClient>>;
  baseUrl: string;
}

/**
 * @title Tiny ERP
 * @appName tiny
 * @description Sync products, contacts, invoices, and financial data.
 * @category ERP
 * @logo https://assets.decocache.com/mcp/c073765e-e869-4244-9504-1edf6af02073/TinyERP.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const { token, baseUrl = "https://api.tiny.com.br/public-api/v3" } = props;

  // Handle different token types
  const _stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  // Create the HTTP client
  const api = createHttpClient<TinyClient>({
    base: baseUrl,
    headers: new Headers({
      "Authorization": `Bearer ${_stringToken}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  // Define the app state
  const state: State = {
    api,
    baseUrl,
  };

  return {
    state,
    manifest,
  };
}

import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { LapsClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Base URL
   * @description Base URL for the LAPS API (ex: https://pp.campinagrande.br)
   */
  baseUrl: string;

  /**
   * @title API Key
   * @description Optional API key for authentication
   */
  apiKey?: string | Secret;
}

// Define the app state
export interface State extends Omit<Props, "apiKey"> {
  api: ReturnType<typeof createHttpClient<LapsClient>>;
}

/**
 * @name LAPS
 * @description Integration with vehicle maintenance history API
 * @category Automotive
 * @logo https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZqXvxtPuRP5TUi1-ULU7vruS7-sQtQ5mofQ&s
 */
export default function App(props: Props): App<Manifest, State> {
  const { apiKey, baseUrl } = props;

  const _stringApiKey = typeof apiKey === "string"
    ? apiKey
    : apiKey?.get?.() ?? "";

  // Create HTTP client with the base URL
  const api = createHttpClient<LapsClient>({
    base: baseUrl,
    headers: _stringApiKey
      ? new Headers({ "Authorization": `Bearer ${_stringApiKey}` })
      : undefined,
    fetcher: fetchSafe,
  });

  // App state that will be available in context
  const state = { baseUrl, api };

  return {
    state,
    manifest,
  };
}

import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { SerperClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title API Key
   * @description Serper API key for authentication
   */
  apiKey: string | Secret;
}

// Define the state of the app
export interface State {
  searchApi: ReturnType<typeof createHttpClient<SerperClient>>;
  scrapeApi: ReturnType<typeof createHttpClient<SerperClient>>;
}

/**
 * @title Serper
 * @appName serper
 * @description Perform intelligent Google searches with structured results.
 * @category SEO
 * @logo https://assets.decocache.com/mcp/ffd61ea7-851d-4a8b-8a02-dedb0d5156ed/Serper.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const { apiKey } = props;

  const stringApiKey = typeof apiKey === "string"
    ? apiKey
    : apiKey?.get?.() ?? "";

  // Create search API client
  const searchApi = createHttpClient<SerperClient>({
    base: "https://google.serper.dev",
    headers: new Headers({
      "Content-Type": "application/json",
      "X-API-KEY": stringApiKey,
    }),
    fetcher: fetchSafe,
  });

  // Create scrape API client
  const scrapeApi = createHttpClient<SerperClient>({
    base: "https://scrape.serper.dev",
    headers: new Headers({
      "Content-Type": "application/json",
      "X-API-KEY": stringApiKey,
    }),
    fetcher: fetchSafe,
  });

  // The state will be available in the context of loaders and actions
  const state = { searchApi, scrapeApi };

  return {
    state,
    manifest,
  };
}

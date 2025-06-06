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
 * @name Serper
 * @description AI-powered search and web scraping API
 * @category SEO
 * @logo https://pbs.twimg.com/profile_images/1622631647702142976/KTEBvoBO_400x400.jpg
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

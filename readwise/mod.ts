import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { ReadwiseClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Readwise API Token
   * @description Your Readwise access token from https://readwise.io/access_token
   * @format password
   */
  token: string | Secret;
}

// App state containing the API client
export interface State {
  api: ReturnType<typeof createHttpClient<ReadwiseClient>>;
}

/**
 * @title Readwise
 * @appName readwise
 * @description Access highlights and notes synced from your favorite reading sources.
 * @category Productivity
 * @logo https://assets.decocache.com/mcp/609eb29f-fa70-4170-ae1c-4108f3a42ea0/Readwise.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const { token } = props;

  // Extract token string from Secret if needed
  const tokenString = typeof token === "string" ? token : token?.get?.() ?? "";

  // Create API client with proper authentication
  const api = createHttpClient<ReadwiseClient>({
    base: "https://readwise.io/api/v2",
    headers: new Headers({
      "Authorization": `Token ${tokenString}`,
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

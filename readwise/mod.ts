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
 * @name Readwise
 * @description Integrate with the Readwise API to fetch and save your reading highlights
 * @category Productivity
 * @logo https://s3.amazonaws.com/readwiseio/2020/11/Group-58.png
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

import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { BrowserUseClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title API Token
   * @description API token from browser-use.com
   */
  token: string | Secret;
}

// Here we define the state of the app
export interface State {
  api: ReturnType<typeof createHttpClient<BrowserUseClient>>;
}

/**
 * @name Browser Use
 * @description Automate browser tasks with AI agents using browser-use.com API
 * @category AI Tools
 * @logo https://browser-use.com/favicon.ico
 */
export default function App(props: Props): App<Manifest, State> {
  const { token } = props;

  const stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  const api = createHttpClient<BrowserUseClient>({
    base: "https://api.browser-use.com",
    headers: new Headers({
      "Authorization": `Bearer ${stringToken}`,
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

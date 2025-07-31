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
 * @title Browser Use
 * @appName browser-use
 * @description Let agents control browsers to automate UI-based tasks.
 * @category AI Tools
 * @logo https://assets.decocache.com/mcp/1a7a2573-023c-43ed-82a2-95d77adca3db/Browser-Use.svg
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

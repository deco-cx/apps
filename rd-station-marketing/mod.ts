import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { RdStationMarketingClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title API Token
   * @description The access token for the RD Station Marketing API (you need to create an app for that)
   */
  token: string | Secret;
}

// State of the app
export interface State {
  api: ReturnType<typeof createHttpClient<RdStationMarketingClient>>;
}

/**
 * @title RD Station Marketing
 * @appName rd-station-marketing
 * @description Manage contacts, segments, and campaigns in RD Station.
 * @category Marketing
 * @logo https://assets.decocache.com/mcp/ed2e7962-6774-4ed9-9275-e22f7f1f267a/RD-Station.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const { token } = props;

  const stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  console.log("Creating client with token", stringToken);
  const api = createHttpClient<RdStationMarketingClient>({
    base: "https://api.rd.services",
    headers: new Headers({
      "Authorization": `Bearer ${stringToken}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  // State available in the context of loaders and actions
  const state = { api };

  return {
    state,
    manifest,
  };
}

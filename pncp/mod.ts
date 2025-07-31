import type { App, FnContext } from "@deco/deco";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { PNCPClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

/**
 * @title PNCP.gov.br
 * @appName pncp
 * @description Explore Brazil's public procurement data via PNCP.
 * @category Government
 * @logo https://assets.decocache.com/mcp/41461083-ef8c-496c-a336-ba6101b0b0f4/PNCP-gov-br.svg
 */
export default function App(): App<Manifest, State> {
  const api = createHttpClient<PNCPClient>({
    base: `https://pncp.gov.br/api/consulta`,
    headers: new Headers({
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

export interface State {
  api: ReturnType<typeof createHttpClient<PNCPClient>>;
}

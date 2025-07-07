import type { App, FnContext } from "@deco/deco";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { PNCPClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

/**
 * @title PNCP.gov.br
 * @description Explore and integrate with Brazil's public procurement data through the official PNCP API.
 * @category Government
 * @logo https://t2.tudocdn.net/668858?w=500&h=500
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

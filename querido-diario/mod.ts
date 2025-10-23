import type { App, FnContext } from "@deco/deco";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { QueridoDiarioClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface State {
  api: ReturnType<typeof createHttpClient<QueridoDiarioClient>>;
}

/**
 * @title Querido Diário
 * @appName querido-diario
 * @description Search and explore Brazilian government gazettes.
 * @category Government
 * @logo https://assets.decocache.com/mcp/0bb451a6-db7c-4f9a-9720-8f87b8898da5/QueridoDirio.svg
 */
export default function App(): App<Manifest, State> {
  const api = createHttpClient<QueridoDiarioClient>({
    base: "https://queridodiario.ok.org.br/api",
    fetcher: fetchSafe,
  });

  const state = { api };

  return {
    state,
    manifest,
  };
}

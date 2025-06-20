import type { App, FnContext } from "deco/mod.ts";
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
 * @description Search for official government gazettes in Brazil.
 * @category Government
 * @logo https://avatars.githubusercontent.com/u/62223996?s=200&v=4
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

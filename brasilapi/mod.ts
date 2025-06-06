import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { BrasilAPIClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Cache Duration
   * @description Duração do cache em segundos para as consultas da API (opcional)
   */
  cacheDuration?: number;
}

// Aqui definimos o estado da app
export interface State {
  api: ReturnType<typeof createHttpClient<BrasilAPIClient>>;
  cacheDuration?: number;
}

/**
 * @name BrasilAPI
 * @description Acesso programático de informações do Brasil como CEP, CNPJ, feriados nacionais, IBGE e mais.
 * @category APIs Públicas
 * @logo https://i.imgur.com/jWsMvso.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { cacheDuration } = props;

  const api = createHttpClient<BrasilAPIClient>({
    base: "https://brasilapi.com.br/api",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  // Estado da app, todos os dados aqui estarão disponíveis
  // no contexto dos loaders, actions e workflows
  const state = { api, cacheDuration };

  return {
    state,
    manifest,
  };
}

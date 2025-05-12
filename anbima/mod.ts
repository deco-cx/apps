import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { AnbimaTitulosPublicosClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Ambiente
   * @description api.anbima.com.br (produção) ou api-testes.anbima.com.br (homologação)
   */
  ambiente?: string;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<AnbimaTitulosPublicosClient>>;
}

/**
 * @name ANBIMA Títulos Públicos
 * @description API de Títulos Públicos da ANBIMA
 * @category Financeiro
 * @logo https://www.anbima.com.br/favicon.ico
 */
export default function App(props: Props): App<Manifest, State> {
  const ambiente = props.ambiente || "api.anbima.com.br";
  const api = createHttpClient<AnbimaTitulosPublicosClient>({
    base: `https://${ambiente}`,
    fetcher: fetchSafe,
  });
  const state = { ...props, api };
  return {
    state,
    manifest,
  };
} 
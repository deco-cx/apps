import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { PNCPClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Base URL da API
   * @description URL base da API do PNCP
   * @default https://pncp.gov.br
   */
  baseUrl?: string;

  /**
   * @title User Agent
   * @description User Agent para identificação nas requisições
   * @default PNCP-Deco-App/1.0
   */
  userAgent?: string;

  /**
   * @title Timeout (ms)
   * @description Timeout para requisições em milissegundos
   * @default 30000
   */
  timeout?: number;

  /**
   * @title Rate Limit
   * @description Limite de requisições por minuto
   * @default 60
   */
  rateLimit?: number;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<PNCPClient>>;
}

/**
 * @title PNCP - Portal Nacional de Contratações Públicas
 * @description App para acessar as APIs abertas do Portal Nacional de Contratações Públicas (PNCP)
 * @category Government
 * @logo https://pncp.gov.br/favicon.ico
 */
export default function App(props: Props): App<Manifest, State> {
  const {
    baseUrl = "https://pncp.gov.br",
    userAgent = "PNCP-Deco-App/1.0",
    timeout = 30000,
    rateLimit = 60,
  } = props;

  const headers = new Headers({
    "User-Agent": userAgent,
    "Accept": "application/json",
    "Content-Type": "application/json",
  });

  const api = createHttpClient<PNCPClient>({
    base: baseUrl,
    headers,
    fetcher: fetchSafe,
  });

  const state: State = {
    ...props,
    baseUrl,
    userAgent,
    timeout,
    rateLimit,
    api,
  };

  return {
    state,
    manifest,
  };
}
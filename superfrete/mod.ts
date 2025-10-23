import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { type Manifest } from "./manifest.gen.ts";
import type { SuperFreteClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title API Token
   * @description SuperFrete API authentication token
   */
  token?: string | Secret;

  /**
   * @title Environment
   * @description Choose API environment (sandbox for testing, production for live)
   * @default "sandbox"
   */
  environment?: "sandbox" | "production";

  /**
   * @title Timeout
   * @description Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
}

// Estado da app
export interface State extends Omit<Props, "token"> {
  api: ReturnType<typeof createHttpClient<SuperFreteClient>>;
  token: string;
}

/**
 * @title SuperFrete
 * @appName superfrete
 * @description Calculate shipping prices and manage freight logistics.
 * @category Logistics
 * @logo https://assets.decocache.com/mcp/2fdb628e-c10c-4fac-8985-b55e383a64b2/SuperFrete.svg
 */
export default function SuperFreteApp(props: Props): App<Manifest, State> {
  const { token, environment = "sandbox", timeout = 30000 } = props;

  const _stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  // Define a URL base baseada no ambiente
  const baseUrl = environment === "production"
    ? "https://api.superfrete.com"
    : "https://sandbox.superfrete.com";

  const api = createHttpClient<SuperFreteClient>({
    base: baseUrl,
    headers: new Headers({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${_stringToken}`,
      "User-Agent": "SuperFrete-Deco-App/1.0",
    }),
    fetcher: fetchSafe,
  });

  // Estado da app, todos os dados aqui estarão disponíveis
  // no contexto dos loaders, actions e workflows
  const state = {
    ...props,
    api,
    token: _stringToken,
    environment,
    timeout,
  };

  return {
    state,
    manifest,
  };
}

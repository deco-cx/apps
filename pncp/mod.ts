import type { App, FnContext } from "@deco/deco";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { PNCPClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title API Token (JWT)
   * @description Bearer token for authenticating with the PNCP API. Required for all API calls.
   */
  token: string | Secret;
}

/**
 * @title PNCP.gov.br
 * @description Explore and integrate with Brazil's public procurement data through the official PNCP API.
 * @category Government
 * @logo https://t2.tudocdn.net/668858?w=500&h=500
 */
export default function App(props: Props): App<Manifest, State> {
  const { token } = props;

  const _stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  const api = createHttpClient<PNCPClient>({
    base: `https://pncp.gov.br/api/consulta`,
    headers: new Headers({
      "Authorization": `Bearer ${_stringToken}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const state = { api, token: _stringToken };

  return {
    state,
    manifest,
  };
}

export interface State {
  api: ReturnType<typeof createHttpClient<PNCPClient>>;
  token: string;
}

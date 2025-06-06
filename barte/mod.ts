import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Client } from "./utils/client.ts";
import { BART_URL } from "./utils/constants.ts";
import { createHttpClient } from "../utils/http.ts";
import { Secret } from "../website/loaders/secret.ts";
import { fetchSafe } from "../utils/fetch.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title API token
   * @description The token to access the Barte API
   */
  token?: Secret | string;
}

export interface State extends Omit<Props, "token"> {
  api: ReturnType<typeof createHttpClient<Client>>;
}

/**
 * @title Barte
 * @description The Barte API is a tool to help you manage your data.
 * @category Payment Platform
 * @logo https://cdn.prod.website-files.com/682ffb2a47584fbeb9a49ddf/682ffb2a47584fbeb9a4a2fa_Logorosa.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const { token } = props;

  const stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  const api = createHttpClient<Client>({
    base: BART_URL,
    headers: new Headers({ "X-Token-Api": `${stringToken}` }),
    fetcher: fetchSafe,
  });

  const state = { ...props, api };

  return {
    state,
    manifest,
  };
}

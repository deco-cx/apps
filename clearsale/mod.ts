import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import type { API, AuthenticationResponse } from "./client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Username
   * @description Username from Clearsale
   */
  username: string | Secret;
  /**
   * @title Password
   * @description Password from Clearsale
   */
  password: string | Secret;
  /**
   * @title Homolog
   * @description Use the homolog environment from Clearsale
   */
  homolog: boolean;
}

// Here we define the state of the app
export interface State {
  api: ReturnType<typeof createHttpClient<API>>;
  getToken: () => Promise<AuthenticationResponse>;
}

/**
 * @title Clearsale
 * @appName clearsale
 * @description Evaluate risk and prevent fraud in online transactions.
 * @category Payment
 * @logo https://assets.decocache.com/mcp/ac358fdd-be54-4656-b1e8-28e37198fb86/Clearsale.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const { username, password, homolog } = props;

  const stringUsername = typeof username === "string"
    ? username
    : username?.get?.() ?? "";
  const stringPassword = typeof password === "string"
    ? password
    : password?.get?.() ?? "";

  const api = createHttpClient<API>({
    fetcher: fetchSafe,
    headers: new Headers({ "Content-Type": "application/json" }),
    base: homolog
      ? "https://datatrustapihml.clearsale.com.br"
      : "https://datatrustapi.clearsale.com.br",
  });

  const getToken = async () => {
    const response = await api["POST /v1/authentication"]({}, {
      body: {
        Username: stringUsername,
        Password: stringPassword,
      },
    });

    return response.json();
  };

  const state = { api, getToken };

  return { state, manifest };
}

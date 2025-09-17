import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { DataForSeoClient } from "./client.ts";

export interface Props {
  /**
   * @title Login (Email)
   * @description Your DataForSEO account email
   */
  login: string | Secret;

  /**
   * @title Password
   * @description Your DataForSEO account password
   */
  password: string | Secret;
}

export interface State extends Props {
  client: ReturnType<typeof createHttpClient<DataForSeoClient>>;
}

export type AppContext = FnContext<State, Manifest>;

/**
 * @title DataForSEO
 * @appName dataforseo
 * @description Access DataForSEO data including keywords, SERP analysis, backlinks, and traffic analytics.
 * @category Analytics
 * @logo https://dataforseo.com/wp-content/uploads/2022/04/cropped-favicon_512.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { login, password } = props;

  const stringLogin = typeof login === "string" ? login : login?.get?.() ?? "";
  const stringPassword = typeof password === "string"
    ? password
    : password?.get?.() ?? "";

  // Create Basic Auth header
  const basicAuth = btoa(`${stringLogin}:${stringPassword}`);

  const client = createHttpClient<DataForSeoClient>({
    base: "https://api.dataforseo.com/v3",
    headers: new Headers({
      "Authorization": `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const state = { ...props, client };

  return {
    state,
    manifest,
  };
}
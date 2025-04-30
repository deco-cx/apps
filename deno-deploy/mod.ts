import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { DenoDeployClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Deno Deploy API Token
   * @description The API token for authenticating with Deno Deploy API (required)
   */
  token: string | Secret;

  /**
   * @title API Version
   * @description The API version to use (default: v1)
   */
  apiVersion?: string;
}

// Here we define the state of the app
export interface State {
  api: ReturnType<typeof createHttpClient<DenoDeployClient>>;
  token: string;
  apiVersion: string;
}

/**
 * @name Deno Deploy
 * @description Official Deno Deploy integration for deco.cx
 * @category Cloud Services
 * @logo https://blog.hyper.io/content/images/2021/05/deno.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { token, apiVersion = "v1" } = props;

  const stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  const api = createHttpClient<DenoDeployClient>({
    base: `https://api.deno.com/${apiVersion}`,
    headers: new Headers({
      "Authorization": `Bearer ${stringToken}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  // it is the state of the app, all data
  // here will be available in the context of
  // loaders, actions and workflows
  const state = {
    api,
    token: stringToken,
    apiVersion,
  };

  return {
    state,
    manifest,
  };
}

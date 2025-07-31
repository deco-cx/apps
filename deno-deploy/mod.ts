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
 * @title Deno Deploy
 * @appName deno-deploy
 * @description Deploy edge functions globally with Deno’s cloud platform.
 * @category Cloud Services
 * @logo https://assets.decocache.com/mcp/f8ee96b7-9d64-4680-a2a8-008bf5f0a6e9/Deno-Deploy.svg
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

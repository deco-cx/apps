import type {
  App as A,
  AppContext as AC,
  AppMiddlewareContext as AMC,
  ManifestOf,
} from "deco/mod.ts";
import { createHttpClient } from "../utils/http.ts";
import workflow from "../workflows/mod.ts";
import { NuvemShopAPI } from "./utils/client.ts";
import { fetchSafe } from "../utils/fetch.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { Secret } from "../website/loaders/secret.ts";

import { ClientOf } from "../utils/http.ts";

export type App = ReturnType<typeof Nuvemshop>;
export type AppContext = AC<App>;
export type AppManifest = ManifestOf<App>;
export type AppMiddlewareContext = AMC<App>;

const BASE_URL = "https://api.nuvemshop.com.br/";

interface State {
  api: ClientOf<NuvemShopAPI>;
  publicUrl: string;
  storeId: string;
}

export let state: null | State = null;

/** @title Nuvemshop */
export interface Props {
  /**
   * @title Public URL
   * @description Your Nuvemshop url, example: https://yourstore.lojavirtualnuvem.com.br/
   */

  publicUrl: string;

  /**
   * @description STORE ID
   */
  storeId: string;

  /**
   * @title Access Token
   */
  accessToken: Secret;

  /**
   * @description Use Nuvemshop as backend platform
   */
  platform: "nuvemshop";
}

export const color = 0x272D4B;

/**
 * @title Nuvemshop
 * @description Loaders, actions and workflows for adding Nuvemshop Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/nuvemshop/logo.png
 */
export default function Nuvemshop(
  { storeId, accessToken, publicUrl }: Props,
) {
  const stringAccessToken = typeof accessToken === "string"
    ? accessToken
    : accessToken?.get?.() ?? "";

  const headers = new Headers();
  headers.set("accept", "application/json");
  headers.set("Authentication", `bearer ${stringAccessToken}`);
  headers.set("content-type", "application/json");

  const api = createHttpClient<NuvemShopAPI>({
    base: `${BASE_URL}`,
    fetcher: fetchSafe,
    headers: headers,
  });

  state = {
    api,
    publicUrl: publicUrl,
    storeId: storeId,
  };

  const app: A<Manifest, State, [ReturnType<typeof workflow>]> = {
    state,
    manifest,
    dependencies: [workflow({})],
  };

  return app;
}

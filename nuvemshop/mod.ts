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

export type App = ReturnType<typeof Nuvemshop>;
export type AppContext = AC<App>;
export type AppManifest = ManifestOf<App>;
export type AppMiddlewareContext = AMC<App>;

const BASE_URL = "https://api.nuvemshop.com.br/";

/** @title Nuvemshop */
export interface Props {
  /**
   * @description STORE ID
   */
  storeId: string;

  /**
   * @title Access Token
   */
  accessToken: string;

  /**
   * @title Public URL
   */

  publicUrl: string;

  /**
   * @description Use Nuvemshop as backend platform
   */
  platform: "nuvemshop";
}

export const color = 0xF71963;

/**
 * @title NuvemShop
 */
export default function Nuvemshop(
  { storeId, accessToken, publicUrl }: Props,
) {
  const headers = new Headers();
  headers.set("accept", "application/json");
  headers.set("Authentication", `bearer ${accessToken}`);
  headers.set("content-type", "application/json");

  const api = createHttpClient<NuvemShopAPI>({
    base: `${BASE_URL}`,
    fetcher: fetchSafe,
    headers: headers,
  });

  const state = {
    api,
    publicUrl: publicUrl,
    storeId: storeId,
  };

  const app: A<Manifest, typeof state, [ReturnType<typeof workflow>]> = {
    state,
    manifest,
    dependencies: [workflow({})],
  };

  return app;
}

import type { App, AppContext as AC, ManifestOf } from "deco/mod.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import { createHttpClient } from "../utils/http.ts";
import workflow from "../workflows/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { SP, VTEXCommerceStable } from "./utils/client.ts";
import { fetchSafe } from "./utils/fetchVTEX.ts";
import { OpenAPI } from "./utils/vtex.openapi.gen.ts";

export type AppContext = AC<ReturnType<typeof VTEX>>;

export type AppManifest = ManifestOf<ReturnType<typeof VTEX>>;

/** @title VTEX */
export interface Props {
  /**
   * @description VTEX Account name. For more info, read here: https://help.vtex.com/en/tutorial/o-que-e-account-name--i0mIGLcg3QyEy8OCicEoC.
   */
  account: string;

  /**
   * @title Public store URL
   * @description Domain that is registered on License Manager (e.g: www.mystore.com.br)
   */
  publicUrl: string;

  /**
   * @title App Key
   * @description Only required for extra features
   */
  appKey?: string;

  /**
   * @title App Token
   * @description Only required for extra features
   * @format password
   */
  appToken?: string;

  /**
   * @description Use VTEX as backend platform
   */
  platform: "vtex";
}

export const color = 0xF71963;

/**
 * @title VTEX
 */
export default function VTEX(
  { appKey, appToken, account, ...props }: Props,
) {
  const sp = createHttpClient<SP>({
    base: `https://sp.vtex.com`,
    fetcher: fetchSafe,
  });
  const vcs = createHttpClient<VTEXCommerceStable>({
    base: `https://${account}.vtexcommercestable.com.br`,
    fetcher: fetchSafe,
  });
  const io = createGraphqlClient({
    endpoint:
      `https://${account}.vtexcommercestable.com.br/api/io/_v/private/graphql/v1`,
    fetcher: fetchSafe,
  });
  const api = createHttpClient<OpenAPI>({
    base: `https://${account}.vtexcommercestable.com.br`,
    fetcher: fetchSafe,
    headers: new Headers({
      "X-VTEX-API-AppKey": appKey ?? "",
      "X-VTEX-API-AppToken": appToken ?? "",
    }),
  });

  const state = { ...props, account, vcs, sp, io, api };

  const app: App<Manifest, typeof state, [ReturnType<typeof workflow>]> = {
    state,
    manifest,
    dependencies: [workflow({})],
  };

  return app;
}

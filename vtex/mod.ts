import type { App, AppContext as AC, ManifestOf } from "deco/mod.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import { createHttpClient } from "../utils/http.ts";
import workflow from "../workflows/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { SP, VTEXCommerceStable } from "./utils/client.ts";
import { fetchSafe } from "./utils/fetchVTEX.ts";

export type AppContext = AC<ReturnType<typeof App>>;

export type AppManifest = ManifestOf<ReturnType<typeof App>>;

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
   * @description Use VTEX as backend platform
   */
  platform: "vtex";
}

interface State extends Props {
  vcs: ReturnType<typeof createHttpClient<VTEXCommerceStable>>;
  sp: ReturnType<typeof createHttpClient<SP>>;
  io: ReturnType<typeof createGraphqlClient>;
}

/**
 * @title VTEX
 */
export default function App(
  state: Props,
): App<Manifest, State, [ReturnType<typeof workflow>]> {
  const sp = createHttpClient<SP>({
    base: `https://sp.vtex.com`,
    fetcher: fetchSafe,
  });
  const vcs = createHttpClient<VTEXCommerceStable>({
    base: `https://${state.account}.vtexcommercestable.com.br`,
    fetcher: fetchSafe,
  });
  const io = createGraphqlClient({
    endpoint:
      `https://${state.account}.vtexcommercestable.com.br/api/io/_v/private/graphql/v1`,
    fetcher: fetchSafe,
  });

  return {
    manifest,
    state: { ...state, vcs, sp, io },
    dependencies: [workflow({})],
  };
}

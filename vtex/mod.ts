import type { App, FnContext } from "deco/mod.ts";
import { fetchSafe } from "./utils/fetchVTEX.ts";
import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { SP, VTEXCommerceStable } from "./utils/client.ts";

export type AppContext = FnContext<State, Manifest>;

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
}

/**
 * @title VTEX
 */
export default function App(state: Props): App<Manifest, State> {
  const sp = createHttpClient<SP>({
    base: `https://sp.vtex.com`,
    fetcher: fetchSafe,
  });
  const vcs = createHttpClient<VTEXCommerceStable>({
    base: `https://${state.account}.vtexcommercestable.com.br`,
    fetcher: fetchSafe,
  });

  return {
    state: { ...state, vcs, sp },
    manifest,
  };
}

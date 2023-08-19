import type { App, FnContext } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<Props, Manifest>;

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

/**
 * @title VTEX
 */
export default function App(state: Props): App<Manifest, Props> {
  return {
    state,
    manifest,
  };
}

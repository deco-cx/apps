import type { App, FnContext } from "$live/mod.ts";
import manifest, { Manifest, name } from "./manifest.gen.ts";

export type AppContext = FnContext<State, Manifest>;

export interface State {
  /**
   * @description VTEX Account name. For more info, read here: https://help.vtex.com/en/tutorial/o-que-e-account-name--i0mIGLcg3QyEy8OCicEoC.
   */
  account: string;

  /**
   * @title Public store URL
   * @description Domain that is registered on License Manager (e.g: www.mystore.com.br)
   */
  publicUrl: string;
}

/**
 * @title VTEX
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return {
    name,
    state,
    manifest,
  };
}

import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

// deno-lint-ignore no-empty-interface
export interface Props {
}

/**
 * @title Brand Assistant
 */
export default function App(
  state: Props,
): App<Manifest, Props> {
  return {
    manifest,
    state,
  };
}

export type AppContext = AC<ReturnType<typeof App>>;

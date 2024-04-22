import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = AC<ReturnType<typeof App>>;

// deno-lint-ignore no-explicit-any
export type State = any;

/**
 * @title Deco Analytics
 * @description Measure your site traffic at a glance in a simple and modern web analytics dashboard.
 * @category Analytics
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/analytics/logo.png
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

// deno-lint-ignore ban-types
export type State = {};

/**
 * @title Deco Weather
 * @description Vary your content based on the current weather of your visitors.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;

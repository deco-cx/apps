import type { App, FnContext } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

// deno-lint-ignore ban-types
export type State = {};

/**
 * @title Deco Workflows
 * @description Build customized and automated tasks.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/workflows/logo.png
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

export type AppContext = FnContext<State, Manifest>;
export type AppManifest = Manifest;

import type { App, FnContext } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

// deno-lint-ignore no-explicit-any
export type State = any;

export type AppContext = FnContext<State, Manifest>;

/**
 * @title Deco Blog
 * @description Manage your posts.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

import type { App, FnContext } from "$live/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

// deno-lint-ignore ban-types
export type State = {};
/**
 * @title Workflows
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

export type AppContext = FnContext<State, Manifest>;

import type { App, FnContext } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

// deno-lint-ignore no-explicit-any
export type State = any;

export type AppContext = FnContext<State, Manifest>;

export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

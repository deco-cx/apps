import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = AC<ReturnType<typeof App>>;

// deno-lint-ignore no-explicit-any
export type State = any;

export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

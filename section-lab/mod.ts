import type { App } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

// deno-lint-ignore ban-types
export type State = {};
/**
 * @title Deco Hub
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

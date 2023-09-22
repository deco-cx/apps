import type { App, FnContext } from "deco/mod.ts";
import { Markdown } from "./components/Markdown.tsx";
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

export type AppContext = FnContext<State, Manifest>;

export const Preview = Markdown(
  new URL("./README.md", import.meta.url).href,
);

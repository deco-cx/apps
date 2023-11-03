import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Markdown } from "../decohub/components/Markdown.tsx";
// deno-lint-ignore no-empty-interface
export interface ConfigPresence {}

/**
 * @title Realtime Presence rooms App
 */
export default function App(
  state: ConfigPresence,
): App<Manifest, ConfigPresence> {
  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;

export const Preview = await Markdown(
  new URL("./README.md", import.meta.url).href,
);

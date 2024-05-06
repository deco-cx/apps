import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

/**
 * @title vnda-to-algolia
 */
export default function App(): App<Manifest> {
  return { manifest, state: {} };
}

export type AppContext = AC<ReturnType<typeof App>>;

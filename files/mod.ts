import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { FileSystemNode } from "./sdk.ts";

export interface State {
  /**
   * @title File System
   */
  root?: FileSystemNode;
}

/**
 * @title My Workspace
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;

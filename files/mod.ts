import { Context } from "deco/deco.ts";
import type { App, AppContext as AC } from "deco/mod.ts";
import { Manifest } from "./manifest.gen.ts";
import { FileSystemNode } from "./sdk.ts";

export interface TsContent {
  path: string;
  content: string;
}

export interface State {
  /**
   * @title File System
   */
  root?: FileSystemNode;
}

/**
 * @title My Workspace
 */
export default async function App(
  state: State,
): Promise<App<Manifest, State>> {
  const { site, release } = Context.active();
  const revision = await release?.revision();

  // TODO: play.deco.cxs
  const manifest = await import(
    `http://localhost:4200/files/${site}@${revision ?? "main"}/manifest.gen.ts`
  ).catch((error) => {
    console.error(error);
    return null;
  });

  return { manifest: manifest?.default, state };
}

export type AppContext = AC<Awaited<ReturnType<typeof App>>>;

import { SourceMap } from "deco/blocks/app.ts";
import { buildSourceMap } from "deco/blocks/utils.tsx";
import type { App, AppContext as AC, AppManifest } from "deco/mod.ts";
import { dirname, join } from "std/path/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { create, FileSystemNode, walk } from "./sdk.ts";

const currdir = dirname(import.meta.url);
const importFromString = (modData: string) =>
  import(`data:text/tsx;base64,${btoa(modData)}`);

const compile = async (
  blockType: keyof Omit<AppManifest, "baseUrl" | "name">,
  { path, content }: TsContent,
  manifest: AppManifest,
  sourceMap: SourceMap,
): Promise<[AppManifest, SourceMap]> => {
  const tsModule = await importFromString(content).catch((err) => {
    console.error("could not compile module", path, err);
    return null;
  });
  if (!tsModule) {
    return [manifest, sourceMap];
  }
  const blockPath = join(currdir, path);
  const blockKey = join(manifest.name, path);

  return [{
    ...manifest,
    [blockType]: {
      ...manifest[blockType],
      [blockKey]: tsModule,
    },
  }, {
    ...sourceMap,
    [blockKey]: {
      path: blockPath,
      content: content,
    },
  }];
};

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
  const { root = create() } = state;

  let appManifest = manifest;
  let appSourceMap: SourceMap = buildSourceMap(appManifest);

  for (const file of walk(root)) {
    if (!/\.tsx?$/.test(file.path)) {
      continue;
    }

    const [_, blockType] = file.path.split("/");

    const [newManifest, newSourceMap] = await compile(
      blockType as keyof Omit<AppManifest, "baseUrl" | "name">,
      file,
      appManifest,
      appSourceMap,
    );
    appManifest = newManifest;
    appSourceMap = newSourceMap;
  }

  return { manifest: appManifest, state, sourceMap: appSourceMap };
}

export type AppContext = AC<Awaited<ReturnType<typeof App>>>;

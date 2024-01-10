import { SourceMap } from "deco/blocks/app.ts";
import { buildSourceMap } from "deco/blocks/utils.tsx";
import type { App, AppContext as AC, AppManifest } from "deco/mod.ts";
import {
  initialize,
  transform,
} from "https://deno.land/x/esbuild@v0.19.7/wasm.js";
import { dirname, join } from "std/path/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { create, FileSystemNode, walk } from "./sdk.ts";

const initializePromise = initialize({
  wasmURL: "https://deno.land/x/esbuild@v0.19.7/esbuild.wasm",
  worker: false,
});

const currdir = dirname(import.meta.url);
const importFromString = async (modData: string) =>
  await transform(modData, {
    loader: "tsx",
    platform: "browser",
    target: ["es2022"],
    format: "esm",
    minify: false,
    jsx: "automatic",
    jsxImportSource: "preact",
  }).then((res) =>
    import(`data:application/javascript;base64,${btoa(res.code)}`)
  );

const compile = async (
  blockType: keyof Omit<AppManifest, "baseUrl" | "name">,
  { path, content }: TsContent,
  manifest: AppManifest,
  sourceMap: SourceMap,
): Promise<[AppManifest, SourceMap]> => {
  await initializePromise;
  const tsModule = await importFromString(content);
  const blockPath = join(currdir, blockType, path);
  const blockKey = `${manifest.name}/${blockType}/${path}`;
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

import { SourceMap } from "deco/blocks/app.ts";
import { buildSourceMap } from "deco/blocks/utils.tsx";
import type { App, AppContext as AC, AppManifest } from "deco/mod.ts";
import {
  initialize,
  transform,
} from "https://deno.land/x/esbuild@v0.19.7/wasm.js";
import { dirname, join } from "std/path/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

const initializePromise = initialize({
  wasmURL: "https://deno.land/x/esbuild@v0.19.7/esbuild.wasm",
  worker: false,
});

export interface File {
  /**
   * @format textarea
   */
  content: string;
}

export interface Directory {
  entries: FileSystemNode[];
}

export const isDir = (node: Directory | File): node is Directory => {
  return Array.isArray((node as Directory)?.entries);
};

/**
 * @title {{{name}}}
 */
export interface FileSystemNode {
  name: string;
  value: Directory | File;
}

export interface State {
  /**
   * @titleBy name
   */
  fileSystem: FileSystemNode[];
}

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

export interface FileSystem {
  [path: string]: string | FileSystem;
}

const buildFs = (nodes: FileSystemNode[]): FileSystem => {
  return nodes.reduce((acc, node) => {
    if (isDir(node.value)) {
      return {
        ...acc,
        [node.name]: buildFs(node.value.entries),
      };
    } else {
      return {
        ...acc,
        [node.name]: node.value.content,
      };
    }
  }, {});
};

export interface TsContent {
  path: string;
  content: string;
}
function* walk(
  fs: FileSystem | string,
  root = "",
): Generator<TsContent> {
  if (typeof fs === "string") {
    if (!root.endsWith(".ts") && !root.endsWith(".tsx")) return;
    return yield { path: root, content: fs };
  }
  for (const [name, subdir] of Object.entries(fs)) {
    yield* walk(subdir, `${root === "" ? "" : `${root}/`}${name}`);
  }
}
/**
 * @title My Workspace
 */
export default async function App(
  { fileSystem }: State,
): Promise<App<Manifest, FileSystem>> {
  const fs = buildFs(fileSystem);
  let appManifest = manifest;
  let appSourceMap: SourceMap = buildSourceMap(appManifest);
  for (const [blockType, blockContentOrFs] of Object.entries(fs)) {
    for (const tsContent of walk(blockContentOrFs)) {
      const [newManifest, newSourceMap] = await compile(
        blockType as keyof Omit<AppManifest, "baseUrl" | "name">,
        tsContent,
        appManifest,
        appSourceMap,
      );
      appManifest = newManifest;
      appSourceMap = newSourceMap;
    }
  }
  return { manifest: appManifest, state: fs, sourceMap: appSourceMap };
}

export type AppContext = AC<Awaited<ReturnType<typeof App>>>;

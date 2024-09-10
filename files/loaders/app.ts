import { ImportMap } from "deco/blocks/app.ts";
import { decoManifestBuilder } from "deco/engine/manifest/manifestGen.ts";
import { createCache } from "https://deno.land/x/deno_cache@0.6.3/mod.ts";
import { build, initialize } from "https://deno.land/x/esbuild@v0.20.2/wasm.js";
import {
  resolveImportMap,
  resolveModuleSpecifier,
} from "https://deno.land/x/importmap@0.2.1/mod.ts";
import { dirname, join } from "std/path/mod.ts";
import { DynamicApp } from "../../decohub/mod.ts";
import { AppContext } from "../mod.ts";
import { create, FileSystemNode, isDir, nodesToMap, walk } from "../sdk.ts";

const initializePromise = initialize({
  wasmURL: "https://deno.land/x/esbuild@v0.20.2/esbuild.wasm",
  worker: false,
});

const decoder = new TextDecoder();
let cache: ReturnType<typeof createCache> | null = null;

async function bundle(
  contents: string,
  importMap: ImportMap,
): Promise<string> {
  await initializePromise;
  const currdirUrl = new URL(currdir);
  const resolvedImportMap = resolveImportMap(importMap, currdirUrl);

  const { outputFiles } = await build({
    stdin: {
      contents,
      loader: "tsx",
    },
    platform: "browser",
    jsxImportSource: "preact",
    jsx: "automatic",
    format: "esm", // Set output format to ESM
    bundle: true,
    write: false,
    plugins: [
      {
        name: "env",
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            try {
              const resolvedByInlineImportMap = resolveModuleSpecifier(
                args.path,
                resolvedImportMap,
                currdirUrl,
              );
              if (!resolvedByInlineImportMap.startsWith("data:")) {
                return {
                  path: args.path,
                  external: true,
                };
              }
              return {
                path: resolvedByInlineImportMap,
                namespace: "code-inline",
              };
            } catch {
              return {
                path: args.path,
                external: true,
              };
            }
          });
          build.onLoad(
            { filter: /.*/, namespace: "code-inline" },
            async (args) => {
              const specifier = args.path;
              cache ??= createCache();
              return {
                loader: "tsx",
                contents: await cache.load(specifier).then(
                  (cached) => {
                    const content = (cached as { content: string | Uint8Array })
                      ?.content;
                    if (!content) {
                      return specifier;
                    }
                    if (typeof content === "string") {
                      return content;
                    }
                    return decoder.decode(content);
                  },
                ),
              };
            },
          );
        },
      },
    ],
  });

  return outputFiles[0].text;
}

const currdir = dirname(import.meta.url);

export const contentToDataUri = (
  path: string,
  modData: string,
  mimeType = "text/tsx",
) =>
  `data:${mimeType};path=${encodeURIComponent(path)};charset=utf-8;base64,${
    btoa(modData)
  }`;
export const contentToJSONDataUri = (path: string, modData: string) =>
  contentToDataUri(path, modData, "application/json");

export interface TsContent {
  path: string;
  content: string;
}

const buildImportMap = (root: FileSystemNode): ImportMap => {
  const importMap: ImportMap = { imports: {} };

  for (const { path, content } of walk(root)) {
    if (!/\.tsx?$/.test(path)) {
      continue;
    }

    const dataUri = contentToDataUri(
      join(currdir, path),
      content,
    );

    importMap.imports[path] = dataUri;
  }

  return importMap;
};
const includeRelative = (app: string, importMap: ImportMap): ImportMap => {
  const newImportMap = { ...importMap, imports: { ...importMap.imports } };
  for (const [key, value] of Object.entries(importMap.imports)) {
    if (key.startsWith(app)) {
      newImportMap.imports[key.replace(app, ".")] = value;
    }
  }
  return newImportMap;
};
export interface Props {
  name: string;
}

const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DynamicApp> => {
  const { root = create() } = ctx;

  if (!isDir(root)) {
    throw new Error("root should be a directory");
  }
  const appFolder = root.nodes.find((node) => node.name === props.name);
  if (!appFolder) {
    throw new Error(`app ${props.name} not found`);
  }

  if (!isDir(appFolder)) {
    throw new Error("root should be a directory");
  }

  const importMap = buildImportMap(appFolder);
  importMap.imports[`${props.name}/`] = `./`;
  importMap.imports["./"] = currdir;
  const nodeMap = nodesToMap(appFolder.nodes);

  const manifestString =
    (await decoManifestBuilder("", props.name, async function* (dir) {
      const fs = nodeMap[dir];

      if (!fs) {
        return;
      }

      for await (const file of walk(fs)) {
        yield file;
      }
    })).build();

  const manifestImport = contentToDataUri(
    join(currdir, props.name, "manifest.gen.ts"),
    manifestString,
  );

  const manifestImportStr = `${props.name}/manifest.gen.ts`;

  importMap.imports[manifestImportStr] = manifestImport;

  const withRelativeImports = includeRelative(props.name, importMap);

  const modTs = appFolder.nodes.find((node) => node.name === "mod.ts");

  let modTsContent = modTs && !isDir(modTs) ? modTs.content : undefined;
  if (!modTsContent) {
    modTsContent = `
\n
import manifest, { Manifest } from "./manifest.gen.ts";
import website, { Props as WebSiteProps } from "apps/website/mod.ts";
import { App, AppContext as AC } from "deco/mod.ts";

export default function App(props: WebSiteProps): App<Manifest, WebSiteProps, [ReturnType<typeof website>]> {
  return {
    state: props,
    manifest,
    dependencies: [website(props)],
    importMap: null,
  };
}
export type AppContext = AC<ReturnType<typeof App>>;
\n
    `;
  }

  return {
    name: props.name,
    importUrl: contentToDataUri(
      join(currdir, props.name, "mod.ts"),
      await bundle(modTsContent, withRelativeImports),
    ),
    importMap,
  };
};

export default loader;

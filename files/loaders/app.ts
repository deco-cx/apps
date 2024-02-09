import { ImportMap } from "deco/blocks/app.ts";
import { decoManifestBuilder } from "deco/engine/manifest/manifestGen.ts";
import { AppManifest } from "deco/mod.ts";
import { createCache } from "https://deno.land/x/deno_cache@0.6.3/mod.ts";
import { build, initialize } from "https://deno.land/x/esbuild@v0.19.7/wasm.js";
import { dirname, join } from "std/path/mod.ts";
import { DynamicApp } from "../../decohub/mod.ts";
import { AppContext } from "../mod.ts";
import { create, FileSystemNode, isDir, nodesToMap, walk } from "../sdk.ts";

const initializePromise = initialize({
  wasmURL: "https://deno.land/x/esbuild@v0.19.7/esbuild.wasm",
  worker: false,
});

const decoder = new TextDecoder();
let cache: ReturnType<typeof createCache> | null = null;
async function resolveImports(
  contents: string,
  inlineImportMap: ImportMap,
): Promise<string> {
  await initializePromise;
  const resolvedImportMap: ImportMap = { imports: {} };
  cache ??= createCache();

  for (const [key, value] of Object.entries(inlineImportMap.imports)) {
    resolvedImportMap.imports[key] = await cache.load(value).then(
      (cached) => {
        const content = (cached as { content: string | Uint8Array }).content;
        if (!content) {
          return key;
        }
        if (typeof content === "string") {
          return content;
        }
        return decoder.decode(content);
      },
    );
  }
  const { outputFiles } = await build({
    stdin: {
      contents,
      loader: "tsx",
    },
    jsxImportSource: "preact",
    format: "esm", // Set output format to ESM
    bundle: true,
    write: false,
    plugins: [{
      name: "replace-imports",
      setup(build) {
        build.onResolve({ filter: /.*/ }, async (args) => {
          const specifier = args.path;
          if (specifier in resolvedImportMap.imports) {
            return {
              path: contentToDataUri(
                await resolveImports(
                  resolvedImportMap.imports[specifier],
                  resolvedImportMap,
                ),
                specifier,
              ),
              external: true,
            };
          } else {
            console.log("DOES NOT HAVE", specifier);
          }
          return null;
        });
      },
    }],
  });

  return outputFiles[0].text;
}

const currdir = dirname(import.meta.url);
export const contentToDataUri = (path: string, modData: string) =>
  `data:text/tsx;path=${encodeURIComponent(path)};charset=utf-8;base64,${
    btoa(modData)
  }`;

export interface TsContent {
  path: string;
  content: string;
}
const rewriteImports = (content: string, importMap: ImportMap): string => {
  let initialContent = content;
  for (const [key, value] of Object.entries(importMap.imports)) {
    initialContent = initialContent.replaceAll(
      `from "${key}"`,
      `from "${value}"`,
    );
  }
  return initialContent;
};
const compile = async (
  blockType: keyof Omit<AppManifest, "baseUrl" | "name">,
  { path, content }: TsContent,
  manifest: AppManifest,
  importMap: ImportMap,
): Promise<AppManifest> => {
  const dataUri = contentToDataUri(
    join(currdir, manifest.name, path),
    rewriteImports(content, importMap),
  );
  const tsModule = await import(dataUri).catch((err) => {
    console.error("could not compile module", path, err);
    return null;
  });
  if (!tsModule) {
    return manifest;
  }

  return {
    ...manifest,
    [blockType]: {
      ...manifest[blockType],
      [path]: tsModule,
    },
  };
};

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
  const bundledManifest = await resolveImports(
    manifestString,
    includeRelative(props.name, importMap),
  );

  console.log(bundledManifest);

  let importUrl: string;
  const modTs = appFolder.nodes.find((node) => node.name === "mod.ts");
  const manifestImport = contentToDataUri(
    join(currdir, props.name, "manifest.gen.ts"),
    bundledManifest,
  );
  if (!modTs || isDir(modTs)) {
    importUrl = contentToDataUri(
      join(currdir, props.name, "mod.ts"),
      `
\n
import manifest, { Manifest } from "${manifestImport}";
import website, { Props as WebSiteProps } from "apps/website/mod.ts";
import { App, AppContext as AC } from "deco/mod.ts";

export default function App(props: WebSiteProps): App<Manifest, WebSiteProps, [ReturnType<typeof website>]> {
  return {
    state: props,
    manifest,
    dependencies: [website(props)],
    importMap: { imports: { "a": "b"} },
  };
}
export type AppContext = AC<ReturnType<typeof App>>;
\n
`,
    );
  } else {
    importUrl = contentToDataUri(
      join(currdir, props.name, "mod.ts"),
      rewriteImports(modTs.content, {
        ...importMap,
        imports: {
          ...importMap.imports,
          [`${props.name}/manifest.gen.ts`]: manifestImport,
        },
      }),
    );
  }
  return {
    name: props.name,
    importUrl,
    importMap,
    // module: {
    //   default: (props: WebSiteProps) => {
    //     return {
    //       state: props,
    //       manifest: appManifest,
    //       importMap: importMap,
    //       dependencies: [website(props)],
    //     };
    //   },
    // },
  };
};

export default loader;

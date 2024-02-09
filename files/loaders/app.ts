import { ImportMap } from "deco/blocks/app.ts";
import { AppManifest } from "deco/mod.ts";
import { dirname, join } from "std/path/mod.ts";
import { DynamicApp } from "../../decohub/mod.ts";
import website, { Props as WebSiteProps } from "../../website/mod.ts";
import { AppContext } from "../mod.ts";
import { create, FileSystemNode, isDir, walk } from "../sdk.ts";

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
    initialContent = initialContent.replace(key, value);
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
  const importMap = buildImportMap(appFolder);

  let appManifest = {
    name: props.name,
    baseUrl: import.meta.url,
  };
  for (const file of walk(appFolder)) {
    if (!/\.tsx?$/.test(file.path)) {
      continue;
    }

    const [_, blockType] = file.path.split("/");

    const newManifest = await compile(
      blockType as keyof Omit<AppManifest, "baseUrl" | "name">,
      file,
      appManifest,
      importMap,
    );
    appManifest = newManifest;
  }
  return {
    name: props.name,
    module: {
      default: (props: WebSiteProps) => {
        return {
          state: props,
          manifest: appManifest,
          importMap: importMap,
          dependencies: [website(props)],
        };
      },
    },
  };
};

export default loader;

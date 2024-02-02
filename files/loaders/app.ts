import { SourceMap } from "deco/blocks/app.ts";
import { AppManifest } from "deco/mod.ts";
import { dirname, join } from "std/path/mod.ts";
import { DynamicApp } from "../../decohub/mod.ts";
import { AppContext } from "../mod.ts";
import { create, walk } from "../sdk.ts";
import website, { Props as WebSiteProps } from "../../website/mod.ts";

const currdir = dirname(import.meta.url);
const importFromString = (modData: string) =>
  import(`data:text/tsx;base64,${btoa(modData)}`);

export interface TsContent {
  path: string;
  content: string;
}
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

export interface Props {
  name: string;
}

const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DynamicApp> => {
  const { root = create() } = ctx;

  let appManifest = {
    name: props.name,
    baseUrl: import.meta.url,
  };
  let appSourceMap: SourceMap = {};

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
  return {
    name: props.name,
    module: {
      default: (props: WebSiteProps) => {
        return {
          state: props,
          manifest: appManifest,
          sourceMap: appSourceMap,
          dependencies: [website(props)],
        };
      },
    },
  };
};

export default loader;

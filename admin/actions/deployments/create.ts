import { decoManifestBuilder } from "deco/engine/manifest/manifestGen.ts";
import {
  DirectoryEntry,
  FileSystemNode,
  isDir,
  mergeFs,
  nodesToMap,
  walk,
} from "../../../files/sdk.ts";
import { Props as CreateProps } from "../../../platforms/subhosting/actions/deployments/create.ts";
import { AppContext } from "../../mod.ts";
import importMapJson from "./deployment_deno.json" with { type: "json" };
import { SubhostingConfig } from "../../../platforms/subhosting/commons.ts";

export type Runtime = "fresh";
export interface SiteState {
  decofile: Record<string, unknown>;
  files: FileSystemNode;
}
export interface Props extends SiteState, SubhostingConfig {
  runtime?: Runtime;
  site: string;
}

export interface CompilerOptions {
  jsx: string;
  jsxImportSource: string;
}

export interface RuntimeTemplate extends SiteState {
  entrypointUrl: string;
  importMapUrl: string | null;
  compilerOptions: CompilerOptions | null;
  envVars?: Record<string, string>;
}

function assertIsDir(fs: FileSystemNode): asserts fs is DirectoryEntry {
  if (!isDir(fs)) {
    throw new Error("Expected directory");
  }
}

const runtimeTemplates: Record<Runtime, (name: Props) => Promise<CreateProps>> =
  {
    fresh: async (
      { site: name, files, decofile, runtime: _ignore, ...props },
    ) => {
      const siteState = {
        ...props,
        entrypointUrl: "main.ts",
        importMapUrl: "import_map.json",
        compilerOptions: {
          jsx: "react-jsx",
          jsxImportSource: "preact",
        },
        files: {
          name: "",
          nodes: [
            {
              name: "deno.json",
              content: JSON.stringify(importMapJson),
            },
            {
              name: "fresh.gen.ts",
              content: `
const manifest = {
    routes: {},
    islands: {},
    baseUrl: import.meta.url,
};
export default manifest;
    `,
            },
            {
              name: "fresh.config.ts",
              content: `
import { defineConfig } from "$fresh/server.ts";
import plugins from "https://denopkg.com/deco-sites/std@1.24.1/plugins/mod.ts";
import manifest from "./manifest.gen.ts";
import tailwind from "./tailwind.config.ts";

export default defineConfig({
    plugins: plugins({
        manifest,
        // deno-lint-ignore no-explicit-any
        tailwind: tailwind as any,
    }),
});
                `,
            },
            {
              name: "apps",
              nodes: [
                {
                  name: "site.ts",
                  content: `
import type { App, AppContext as AC } from "deco/types.ts";
import type { Manifest } from "../manifest.gen.ts";
import manifest from "../manifest.gen.ts";
export interface State {
    url: string;
}
export default function App(
    state: State,
): App<Manifest, State> {
    return {
        manifest,
        state,
    };
}
export type AppContext = AC<ReturnType<typeof App>>;
    `,
                },
              ],
            },
          ],
        },
        decofile: {
          site: {
            __resolveType: `${name}/apps/site.ts`,
          },
          ...decofile,
        },
      };
      const resultFs = mergeFs(files, siteState.files);
      assertIsDir(resultFs);
      const nodeMap = nodesToMap(resultFs.nodes);
      const manifest = {
        name: "manifest.gen.ts",
        content: (await decoManifestBuilder("", name, async function* (dir) {
          for await (const file of walk(nodeMap[dir])) {
            yield file;
          }
        })).build(),
      };
      resultFs.nodes.push(manifest);
      return { ...siteState, files: resultFs };
    },
  };

export interface Deployment {
  domain: string;
}
export default async function create(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Deployment> {
  return await ctx.invoke["deno-subhosting"].actions.deployments.create(
    await runtimeTemplates[props.runtime ?? "fresh"](props),
  );
}

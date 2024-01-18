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
import { Deployment } from "../../platform.ts";
import importMapJson from "./deployment_deno.json" with { type: "json" };

export type Runtime = "fresh" | "naked";
export interface SiteState {
  decofile: Record<string, unknown>;
  files: FileSystemNode;
}
export interface Props extends SiteState {
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
    naked: (
      { runtime: _ignore, ...props },
    ) =>
      Promise.resolve({
        ...props,
        entryPointUrl: "main.ts",
        importMapUrl: null,
        compilerOptions: null,
        files: {
          name: "",
          nodes: [{
            name: "main.ts",
            content: `Deno.serve(() => new Response("Hello, World!"));`,
          }],
        },
      }),
    fresh: async (
      { site: name, files, decofile, runtime: _ignore, ...props },
    ) => {
      const siteState = {
        ...props,
        entryPointUrl: "main.ts",
        importMapUrl: "deno.json",
        compilerOptions: {
          jsx: "react-jsx",
          jsxImportSource: "preact",
        },
        files: {
          name: "",
          nodes: [
            {
              name: "main.ts",
              content: `
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />
import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import decoManifest from "./manifest.gen.ts";
import decoPlugin from "deco/plugins/deco.ts";
import { context } from "deco/deco.ts";

await start(manifest, {
  plugins: [
    decoPlugin({
      manifest: decoManifest,
    }),
  ],
});
            `,
            },
            {
              name: "deno.json",
              content: JSON.stringify(importMapJson),
            },
            {
              name: "routes",
              nodes: [
                {
                  name: "_app.tsx",
                  content: `
import { asset, Head } from "$fresh/runtime.ts";
import { defineApp } from "$fresh/server.ts";
import { Context } from "deco/deco.ts";

export default defineApp(async (_req, ctx) => {
  const revision = await Context.active().release?.revision();

  return (
    <>
      {/* Include Icons and manifest */}
      <Head>
        {/* Enable View Transitions API */}
        <meta name="view-transition" content="same-origin" />

        {/* Tailwind v3 CSS file */}
        <link
          href={asset(\`/styles.css?revision=\${revision}\`)}
          rel="stylesheet"
        />
      </Head>

      {/* Rest of Preact tree */}
      <ctx.Component />
    </>
  );
});`,
                },
              ],
            },
            {
              name: "fresh.gen.ts",
              content: `
import * as $_app from "./routes/_app.tsx";              

const manifest = { 
    routes: {
      "./routes/_app.tsx": $_app,
    },
    islands: {},
    baseUrl: import.meta.url,
};
export default manifest;
    `,
            },
            {
              name: ".decofile.json",
              content: JSON.stringify({
                site: {
                  __resolveType: `${name}/apps/site.ts`,
                },
                decohub: {
                  __resolveType: `${name}/apps/decohub.ts`,
                },
                "admin-app": {
                  __resolveType: `decohub/apps/admin.ts`,
                },
                "files": {
                  __resolveType: `decohub/apps/files.ts`,
                },
                ...decofile,
              }),
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
                  name: "decohub.ts",
                  content:
                    `export { default, Preview } from "apps/decohub/mod.ts";`,
                },
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
      };
      const resultFs = mergeFs(
        files ?? { name: "", nodes: [] },
        siteState.files,
      );
      assertIsDir(resultFs);
      const nodeMap = nodesToMap(resultFs.nodes);
      const manifest = {
        name: "manifest.gen.ts",
        content: (await decoManifestBuilder("", name, async function* (dir) {
          const fs = nodeMap[dir];

          if (!fs) {
            return;
          }

          for await (const file of walk(fs)) {
            yield file;
          }
        })).build(),
      };
      resultFs.nodes.push(manifest);
      return { ...siteState, files: resultFs };
    },
  };

export default async function create(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Deployment> {
  try {
    const res = await runtimeTemplates[props.runtime ?? "fresh"](props);

    res.envVars = {
      ...res.envVars,
      DECO_RELEASE: "file:///src/.decofile.json",
      DECO_ALLOWED_AUTHORITIES: "configs.decocdn.com,deno.dev",
      DECO_SITE_NAME: props.site,
    };

    const platform = await ctx.invoke["deco-sites/admin"].loaders.platforms
      .forSite({ site: props.site });

    return await platform.deployments.create(
      { ...res, site: props.site, mode: "files" },
    );
  } catch (error) {
    console.error(error);

    throw error;
  }
}

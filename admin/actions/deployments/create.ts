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

const DECOFILE_NAME = ".decofile.json";
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

const runtimeTemplates: Record<
  Runtime,
  (props: Props, supportsDynamicImport?: boolean) => Promise<CreateProps>
> = {
  naked: async (
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
import { FreshContext } from "$fresh/server.ts";
import { Page } from "deco/blocks/page.tsx";
import { fromEndpoint } from "deco/engine/releases/fetcher.ts";
import { contextProvider } from "deco/runtime/fresh/middlewares/1_contextProvider.ts";
import {
  buildDecoState,
  injectLiveStateForPath,
} from "deco/runtime/fresh/middlewares/2_stateBuilder.ts";
import { handler as mainMiddleware } from "deco/runtime/fresh/middlewares/3_main.ts";
import { handler as metaHandler } from "deco/runtime/fresh/routes/_meta.ts";
import {
  handler as previewHandler,
} from "deco/runtime/fresh/routes/blockPreview.tsx";
import { handler as entrypoint } from "deco/runtime/fresh/routes/entrypoint.tsx";
import { handler as invokeKeyHandler } from "deco/runtime/fresh/routes/invoke.ts";
import { default as PreviewsPage } from "deco/runtime/fresh/routes/previews.tsx";
import {
  handler as releaseHandler,
} from "deco/runtime/fresh/routes/release.ts";
import { renderToString } from "preact-render-to-string";
import manifest from "./manifest.gen.ts";

const entrypointHandler = injectLiveStateForPath(
  "./routes/[...catchall].tsx",
  entrypoint.GET,
) as MiddlewareHandler;

const render = (mprops: { page: Page }) => {
  const { page: { Component, props } } = mprops;
  return new Response(
    renderToString(
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <Component {...props} />
        </body>
      </html>,
    ),
    {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
    },
  );
};
const router: MiddlewareHandler = (req, ctx) => {
  const { pathname } = new URL(req.url);
  if (pathname === "/live/_meta") {
    return metaHandler(req);
  }
  if (pathname === "/live/previews") {
    return render({ page: { Component: PreviewsPage, props: {} } });
  }
  if (pathname.startsWith("/live/previews/")) {
    return previewHandler(req, ctx);
  }
  if (pathname === "/.decofile" || pathname === "/live/release") {
    return releaseHandler(req, ctx);
  }
  if (pathname.startsWith("/live/invoke/")) {
    return invokeKeyHandler(req, {
      ...ctx,
      params: {
        key: pathname.replace("/live/invoke/", ""),
      },
    });
  }
  return entrypointHandler(req, ctx);
};
type MiddlewareHandler = (
  req: Request,
  // deno-lint-ignore no-explicit-any
  ctx: FreshContext<any>,
) => Promise<Response> | Response;
const middlewares: MiddlewareHandler[] = [
  contextProvider({
    manifest: {
      apps: { ...manifest.apps },
      baseUrl: manifest.baseUrl,
      name: manifest.name,
    },
    release: fromEndpoint(Deno.env.get("DECO_RELEASE")!),
  }),
  buildDecoState(),
  ...mainMiddleware,
  router,
];

export const compose = (
  ...middlewares: MiddlewareHandler[]
): MiddlewareHandler => {
  const last = middlewares[middlewares.length - 1];
  // deno-lint-ignore no-explicit-any
  return async function (req: Request, ctx: FreshContext<any>) {
    // last called middleware #
    let index = -1;
    return await dispatch(0);
    async function dispatch(
      i: number,
    ): Promise<Response> {
      if (i <= index) {
        return Promise.reject(new Error("next() called multiple times"));
      }
      index = i;
      const resolver = middlewares[i];
      if (i === middlewares.length) {
        return await last(req, ctx);
      }
      return await resolver(req, {
        ...ctx,
        next: dispatch.bind(null, i + 1),
      });
    }
  };
};

const handler = compose(...middlewares);
Deno.serve(async (req, conn) => {
  const ctx = {
    ...conn,
    state: {},
    render,
  };
  // @ts-ignore: conn info should be fine.
  return await handler(req, ctx);
});
              `,
          },
          {
            name: "deno.json",
            content: JSON.stringify(importMapJson),
          },
          {
            name: ".decofile.json",
            content: JSON.stringify({
              site: {
                __resolveType: `${name}/apps/site.ts`,
                routes: [{ __resolveType: "website/loaders/pages.ts" }],
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
            name: "apps",
            nodes: [
              {
                name: "decohub.ts",
                content: `
import * as admin from "apps/admin/mod.ts";
import * as files from "apps/files/mod.ts";

/**
 * @title Decohub
 */
export default async function App(
  _p: unknown,
) {
  return {
    manifest: {
      apps: {
        "decohub/apps/admin.ts": admin,
        "decohub/apps/files.ts": files,
      },
      name: "decohub",
    },
    state: {},
    sourceMap: {
      "decohub/apps/admin.ts": await import.meta.resolve("apps/admin/mod.ts"),
      "decohub/apps/files.ts": await import.meta.resolve("apps/files/mod.ts"),
    },
  };
}
`,
              },
              {
                name: "site.ts",
                content: `
  import { App, AppContext as AC } from "deco/mod.ts";
  import website, { Props as WebSiteProps } from "apps/website/mod.ts";
  import manifest, { Manifest } from "../manifest.gen.ts";
  
  export type Props = WebSiteProps;
  
  export type AppContext = AC<ReturnType<typeof Site>>;
  
  export default function Site(
    props: Props,
  ): App<Manifest, Props, [ReturnType<typeof website>]> {
    return {
      state: props,
      manifest,
      dependencies: [
        website(props),
      ],
    };
  }
  
  export { onBeforeResolveProps } from "apps/website/mod.ts";
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
  fresh: async (
    { site: name, files, decofile, runtime: _ignore, ...props },
    supportsDynamicImport,
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
import config from "./fresh.config.ts";
import manifest from "./fresh.gen.ts";

await start(manifest, config);
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
                routes: [{ __resolveType: "website/loaders/pages.ts" }],
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
            name: "tailwind.config.ts",
            content: `
export default {
  content: ["./**/*.tsx"],
  theme: { container: { center: true } },
};
              `,
          },
          {
            name: "fresh.config.ts",
            content: `
import { defineConfig } from "$fresh/server.ts";
import plugins from "https://denopkg.com/deco-sites/std@10bfbc4446818c47f49525857edbb2a1f3bb09d7/plugins/mod.ts";
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
                content: `
import * as admin from "apps/admin/mod.ts";
import * as files from "apps/files/mod.ts";

/**
 * @title Decohub
 */
export default async function App(
  _p: unknown,
) {
  return {
    manifest: {
      apps: {
        "decohub/apps/admin.ts": admin,
        "decohub/apps/files.ts": files,
      },
      name: "decohub",
    },
    state: {},
    sourceMap: {
      "decohub/apps/admin.ts": await import.meta.resolve("apps/admin/mod.ts"),
      "decohub/apps/files.ts": await import.meta.resolve("apps/files/mod.ts"),
    },
  };
}
                    `,
              },
              {
                name: "site.ts",
                content: `
import { App, AppContext as AC } from "deco/mod.ts";
import website, { Props as WebSiteProps } from "apps/website/mod.ts";
import manifest, { Manifest } from "../manifest.gen.ts";

export type Props = WebSiteProps;

export type AppContext = AC<ReturnType<typeof Site>>;

export default function Site(
  props: Props,
): App<Manifest, Props, [ReturnType<typeof website>]> {
  return {
    state: props,
    manifest,
    dependencies: [
      website(props),
    ],
  };
}

export { onBeforeResolveProps } from "apps/website/mod.ts";
    `,
              },
            ],
          },
        ],
      },
    };
    let resultFs: FileSystemNode = siteState.files;
    const decofileContent = {
      site: {
        __resolveType: `${name}/apps/site.ts`,
        routes: [{ __resolveType: "website/loaders/pages.ts" }],
      },
      decohub: {
        __resolveType: `${name}/apps/decohub.ts`,
      },
      "admin-app": {
        __resolveType: `decohub/apps/admin.ts`,
      },
      "files": {
        root: {
          name: "",
          nodes: [],
        } as FileSystemNode,
        __resolveType: `decohub/apps/files.ts`,
      },
      ...decofile,
    };
    if (!supportsDynamicImport) {
      resultFs = mergeFs(
        files ?? { name: "", nodes: [] },
        siteState.files,
      );
    } else {
      decofileContent.files = { ...decofileContent.files, root: files };
    }
    assertIsDir(resultFs);
    // add decofile
    resultFs.nodes.push({
      name: DECOFILE_NAME,
      content: JSON.stringify(decofileContent),
    });
    // end add decofile
    // build manifest
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
    //
    return { ...siteState, files: resultFs };
  },
};

export default async function create(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Deployment> {
  try {
    const platform = await ctx.invoke["deco-sites/admin"].loaders.platforms
      .forSite({ site: props.site });

    const res = await runtimeTemplates[props.runtime ?? "fresh"](props);

    res.envVars = {
      ...res.envVars,
      DECO_RELEASE: `file://${
        platform.sourceDirectory ?? "/src"
      }/${DECOFILE_NAME}`,
      DECO_SITE_NAME: props.site,
    };

    return await platform.deployments.create(
      { ...res, site: props.site, mode: "files" },
    );
  } catch (error) {
    console.error(error);

    throw error;
  }
}

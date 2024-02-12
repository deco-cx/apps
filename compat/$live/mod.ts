// deno-lint-ignore-file no-explicit-any
import type { App } from "deco/mod.ts";
// this should not be changed to $live because newly created versions might not include live.gen.ts.
import { buildImportMap } from "deco/blocks/utils.tsx";
import type { Manifest as LiveManifest } from "deco/live.gen.ts";

import type { Manifest as WebSiteManifest } from "../../website/manifest.gen.ts";
import webSite, { Props } from "../../website/mod.ts";
import type { Manifest as WorkflowsManifest } from "../../workflows/manifest.gen.ts";

import { AppContext as AC, ImportMap } from "deco/blocks/app.ts";
import workflows from "../../workflows/mod.ts";
import manifest, { Manifest as _Manifest } from "./manifest.gen.ts";

export { onBeforeResolveProps } from "../../website/mod.ts";
export type AppContext = AC<ReturnType<typeof App>>;
export type Manifest = Omit<LiveManifest, "routes" | "islands"> & _Manifest;

export type ManifestMappings = Partial<
  {
    [
      blockType in keyof Omit<
        LiveManifest,
        "name" | "baseUrl" | "routes" | "islands"
      >
    ]: Partial<
      {
        [
          blockKey in keyof Omit<
            LiveManifest,
            "name" | "baseUrl" | "routes" | "islands"
          >[blockType]
        ]: blockType extends keyof (WebSiteManifest | WorkflowsManifest)
          ? keyof (WebSiteManifest[blockType] & WorkflowsManifest[blockType])
          : blockType extends keyof WebSiteManifest
            ? keyof (WebSiteManifest[blockType])
          : blockType extends keyof WorkflowsManifest
            ? keyof (WorkflowsManifest[blockType])
          : never;
      }
    >;
  }
>;

const manifestMappings: ManifestMappings = {
  pages: {
    "$live/pages/LivePage.tsx": "website/pages/Page.tsx",
  },
  loaders: {
    "$live/loaders/workflows/events.ts": "workflows/loaders/events.ts",
    "$live/loaders/workflows/get.ts": "workflows/loaders/get.ts",
  },
  handlers: {
    "$live/handlers/fresh.ts": "website/handlers/fresh.ts",
    "$live/handlers/proxy.ts": "website/handlers/proxy.ts",
    "$live/handlers/routesSelection.ts": "website/handlers/router.ts",
    "$live/handlers/redirect.ts": "website/handlers/redirect.ts",
    "$live/handlers/workflowRunner.ts": "workflows/handlers/workflowRunner.ts",
  },
  matchers: {
    "$live/matchers/MatchAlways.ts": "website/matchers/always.ts",
    "$live/matchers/MatchCron.ts": "website/matchers/cron.ts",
    "$live/matchers/MatchDate.ts": "website/matchers/date.ts",
    "$live/matchers/MatchDevice.ts": "website/matchers/device.ts",
    "$live/matchers/MatchEnvironment.ts": "website/matchers/environment.ts",
    "$live/matchers/MatchHost.ts": "website/matchers/host.ts",
    "$live/matchers/MatchLocation.ts": "website/matchers/location.ts",
    "$live/matchers/MatchMulti.ts": "website/matchers/multi.ts",
    "$live/matchers/MatchRandom.ts": "website/matchers/random.ts",
    "$live/matchers/MatchSite.ts": "website/matchers/site.ts",
    "$live/matchers/MatchUserAgent.ts": "website/matchers/userAgent.ts",
  },
  actions: {
    "$live/actions/secrets/encrypt.ts": "website/actions/secrets/encrypt.ts",
    "$live/actions/workflows/cancel.ts": "workflows/actions/cancel.ts",
    "$live/actions/workflows/signal.ts": "workflows/actions/signal.ts",
    "$live/actions/workflows/start.ts": "workflows/actions/start.ts",
  },
  flags: {
    "$live/flags/audience.ts": "website/flags/audience.ts",
    "$live/flags/everyone.ts": "website/flags/everyone.ts",
    "$live/flags/flag.ts": "website/flags/flag.ts",
    "$live/flags/multivariate.ts": "website/flags/multivariate.ts",
  },
};

export type { Props };
/**
 * @title $live
 */
export default function App(
  state: Props,
): App<
  Manifest,
  Props,
  [ReturnType<typeof webSite>, ReturnType<typeof workflows>]
> {
  const { resolvables: _ignoreResolvables, ...webSiteApp } = webSite(state);
  const workflowsApp = workflows({});
  const webSiteManifest = webSiteApp.manifest;
  const workflowsManifest = workflowsApp.manifest;
  const webSiteManifestImportMap = buildImportMap(webSiteManifest);
  const workflowsManifestImportMap = buildImportMap(workflowsManifest);
  const importMap: ImportMap = {
    ...webSiteManifestImportMap,
    ...workflowsManifestImportMap,
    imports: {
      ...webSiteManifestImportMap.imports,
      ...workflowsManifestImportMap.imports,
    },
  };
  const _manifest = { ...manifest };

  for (const [_blockKey, blockMappings] of Object.entries(manifestMappings)) {
    const blockKey = _blockKey as keyof _Manifest;
    _manifest[blockKey] = { ...(manifest as any)[blockKey] ?? {} };
    for (const [from, to] of Object.entries(blockMappings)) {
      if (to.startsWith("website")) {
        // @ts-ignore: blockkeys and from/to always exists for those types
        _manifest[blockKey][from] = webSiteManifest[blockKey][to];
        importMap.imports[from] = webSiteManifestImportMap.imports[to];
      } else if (to.startsWith("workflows")) {
        // @ts-ignore: blockkeys and from/to always exists for those types
        _manifest[blockKey][from] = workflowsManifest[blockKey][to];
        importMap.imports[from] = workflowsManifestImportMap.imports[to];
      }
    }
  }

  const liveImportMap = buildImportMap(manifest);
  return {
    state,
    importMap: {
      ...liveImportMap,
      ...importMap,
      imports: {
        ...liveImportMap.imports,
        ...importMap.imports,
      },
    },
    manifest: _manifest as Manifest,
    dependencies: [webSiteApp, workflowsApp],
  };
}

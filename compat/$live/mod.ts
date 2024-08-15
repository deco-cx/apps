// deno-lint-ignore-file no-explicit-any
import type { App } from "deco/mod.ts";
// this should not be changed to $live because newly created versions might not include live.gen.ts.
import { buildImportMap } from "deco/blocks/utils.tsx";

import type { Manifest as WebSiteManifest } from "../../website/manifest.gen.ts";
import webSite, { Props } from "../../website/mod.ts";
import type { Manifest as WorkflowsManifest } from "../../workflows/manifest.gen.ts";

import { AppContext as AC, ImportMap } from "deco/blocks/app.ts";
import workflows from "../../workflows/mod.ts";
import manifest, { Manifest as _Manifest } from "./manifest.gen.ts";

export { onBeforeResolveProps } from "../../website/mod.ts";
export type AppContext = AC<ReturnType<typeof App>>;
export type Manifest = _Manifest;

export type ManifestMappings = Partial<
  {
    [
      blockType in keyof Omit<
        Manifest,
        "name" | "baseUrl" | "routes" | "islands"
      >
    ]: Partial<
      {
        [
          blockKey in keyof Omit<
            Manifest,
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
    manifest,
    dependencies: [webSiteApp, workflowsApp],
  };
}

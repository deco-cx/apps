// deno-lint-ignore-file no-explicit-any
import type { App } from "deco/mod.ts";

import webSite, { Props } from "../../website/mod.ts";

import { AppContext as AC } from "deco/blocks/app.ts";
import workflows from "../../workflows/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export { onBeforeResolveProps } from "../../website/mod.ts";

export type AppContext = AC<ReturnType<typeof App>>;

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

  return {
    state,
    manifest,
    dependencies: [webSiteApp, workflowsApp],
  };
}

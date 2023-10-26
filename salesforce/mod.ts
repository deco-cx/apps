import type {
  App as A,
  AppContext as AC,
  AppMiddlewareContext as AMC,
  ManifestOf,
} from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { Account } from "./utils/types.ts";
import { SalesforceClient } from "./utils/client.ts";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "./utils/fetchSalesforce.ts";
import { middleware } from "./middleware.ts";
import workflow from "../workflows/mod.ts";

export type App = ReturnType<typeof Salesforce>;
export type AppContext = AC<App>;
export type AppManifest = ManifestOf<App>;
export type AppMiddlewareContext = AMC<App>;

/** @title Salesforce */
export interface Props extends Account {
  platform: "salesforce";
}

export const color = 0x02A0E0;

/**
 * @title Salesforce
 */
export default function Salesforce(
  prop: Props,
) {
  const slc = createHttpClient<SalesforceClient>({
    base: `https://${prop.shortCode}.api.commercecloud.salesforce.com`,
    fetcher: fetchSafe,
  });

  const state = { ...prop, slc };

  const app: A<Manifest, typeof state, [ReturnType<typeof workflow>]> = {
    state,
    manifest,
    middleware,
    dependencies: [workflow({})],
  };

  return app;
}

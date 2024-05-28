import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createClient as createSQLClient, drizzle } from "./deps.ts";
import { getSQLClientConfig, StorageConfig } from "./utils.ts";

export interface Props extends StorageConfig {}

/**
 * @title Deco Records
 * @description Deco database for records
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/records/logo.png
 */
export default function Records(
  { url, authToken, ...state }: Props,
) {
  const sqlClient = createSQLClient(getSQLClientConfig({ url, authToken }));

  const appState = {
    ...state,
    sqlClient,
    drizzle: drizzle(sqlClient),
  };

  const app: App<Manifest, typeof appState> = {
    manifest,
    state: appState,
  };

  return app;
}

export type RecordsApp = ReturnType<typeof Records>;
export type AppContext = AC<RecordsApp>;

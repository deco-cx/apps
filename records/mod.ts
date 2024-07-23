import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import {
  createClient as createSQLClient,
  createLocalClient,
  drizzle,
} from "./deps.ts";
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
  const sqlClientConfig = getSQLClientConfig({ url, authToken });
  const sqlClient =
    sqlClientConfig.url.startsWith("file://") && createLocalClient
      ? createLocalClient(sqlClientConfig)
      : createSQLClient(sqlClientConfig);

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

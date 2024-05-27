import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Secret } from "../website/loaders/secret.ts";
import { createClient as createSQLClient } from "npm:@libsql/client@0.6.0/node";
import { drizzle } from "https://esm.sh/drizzle-orm@0.30.10/libsql";

const getClientConfig = ({ authToken, url }: StorageConfig) => {
  const isLocal = !authToken?.get();
  if (isLocal) {
    return ({
      url: `file://${Deno.cwd()}/sqlite.db`,
      authToken: "",
    });
  }
  return {
    url,
    authToken: authToken?.get?.() ?? "",
  };
};

interface StorageConfig {
  /**
   * @title Url
   * @description database url with libsql protocol
   */
  url: string;
  /**
   * @description Database authentication token
   */
  authToken: Secret;
}

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
  const sqlClient = createSQLClient(getClientConfig({ url, authToken }));

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

import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createClient as createSQLClient } from "npm:@libsql/client@0.6.0/node";
import { Secret } from "../website/loaders/secret.ts";

const getClientConfig = ({ authToken, url }: StorageConfig) => {
  const isLocal = !authToken.get();
  if (isLocal) {
    return ({
      url: `file://${Deno.cwd()}/sqlite.db`,
      authToken: "",
    });
  }
  return {
    url,
    authToken: authToken.get?.() ?? "",
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

export interface Props extends StorageConfig {
}

/**
 * @title Turso
 * @description App for using turso https://turso.tech/
 * @category Tool
 * @logo todo
 */
export default function Turso(
  { url, authToken, ...state }: Props,
) {
  const client = createSQLClient(
    getClientConfig({ authToken, url }),
  );

  const appState = {
    ...state,
    client,
  };

  const app: App<Manifest, typeof appState> = {
    manifest,
    state: appState,
  };

  return app;
}

export type TursoApp = ReturnType<typeof Turso>;
export type AppContext = AC<TursoApp>;

import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createClient as createSQLClient } from "npm:@libsql/client";
import { Secret } from "../website/loaders/secret.ts";

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
  const client = createSQLClient({
    url,
    authToken: authToken.get?.() ?? "",
  });

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

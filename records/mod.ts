import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import TursoApp, { Props as TursoProps } from "../turso/mod.ts";
import { drizzle } from "https://esm.sh/drizzle-orm@0.30.10/libsql";

export interface Props extends TursoProps {}

/**
 * @title Deco Records
 * @description Deco database for records
 * @category Tool
 * @logo todo
 */
export default function Records(
  { url, authToken, ...state }: Props,
) {
  const tursoApp = TursoApp({ url, authToken });
  const sqlClient = tursoApp.state.client;

  const appState = {
    ...state,
    sqlClient,
    drizzle: drizzle(sqlClient),
  };

  const app: App<Manifest, typeof appState, [typeof tursoApp]> = {
    manifest,
    state: appState,
    dependencies: [
      tursoApp,
    ],
  };

  return app;
}

export type RecordsApp = ReturnType<typeof Records>;
export type AppContext = AC<RecordsApp>;

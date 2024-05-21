import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import TursoApp, { Props as TursoProps } from "../turso/mod.ts";

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

  const appState = {
    ...state,
    sqlClient: tursoApp.state.client,
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

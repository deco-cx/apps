import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import tursoApp, { Props as TursoProps } from "../turso/mod.ts";

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
  const tursoAppInstance = tursoApp({ url, authToken });
  const sqlClient = tursoAppInstance.state.client;

  const appState = {
    ...state,
    sqlClient,
  };

  const app: App<Manifest, typeof appState, [typeof tursoAppInstance]> = {
    manifest,
    state: appState,
    dependencies: [
      tursoAppInstance,
    ],
  };

  return app;
}

export type RecordsApp = ReturnType<typeof Records>;
export type AppContext = AC<RecordsApp>;

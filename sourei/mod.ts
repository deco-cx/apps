import type { App, AppContext as AC } from "deco/mod.ts";
import { createFetchRequester } from "npm:@algolia/requester-fetch@4.20.0";
import algolia from "npm:algoliasearch@4.20.0";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = AC<ReturnType<typeof App>>;

export interface State {
}

/**
 * @title Sourei
 */
export default function App(
  props: State,
) {
  const state = props;

  const app: App<Manifest, typeof state> = {
    manifest,
    state,
  };

  return app;
}

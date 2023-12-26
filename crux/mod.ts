import manifest, { Manifest } from "./manifest.gen.ts";
import type { App as A } from "deco/mod.ts";

export type App = ReturnType<typeof CRUX>;

export interface State {
    /**
     * @title Site URL
     * @description The URL of the site that will be used to generate the dashboard. It works for websites with high traffic volume
     */
  siteUrl: string;
}

export default function CRUX(state: State): A<Manifest, State> {
  return {
    state,
    manifest,
  };
}

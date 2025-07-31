import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<Props, Manifest>;

// deno-lint-ignore no-empty-interface
export interface Props {
}

/**
 * @appName js-bundler
 * @description Build and bundle JavaScript/TypeScript code using esbuild
 * @category Developer Tools
 * @logo https://esbuild.github.io/favicon.svg
 */
export default function App(props: Props): App<Manifest, Props> {
  return {
    state: props,
    manifest,
  };
}

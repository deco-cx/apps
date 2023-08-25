export { onBeforeResolveProps } from "../../website/mod.ts";
import $live from "../$live/mod.ts";

import type { App } from "$live/mod.ts";
import type { Manifest as StdManifest } from "https://denopkg.com/deco-sites/std@1.20.11/live.gen.ts";
import type { Manifest as _Manifest } from "./manifest.gen.ts";
import manifest from "./manifest.gen.ts";

export type Manifest =
  & Partial<
    Omit<StdManifest, "functions"> & {
      functions: Partial<StdManifest["functions"]>;
    }
  >
  & _Manifest;

// deno-lint-ignore no-empty-interface
export interface Props {}

export default function Std(
  props: Props,
): App<Manifest, Props, [ReturnType<typeof $live>]> {
  const liveApp = $live(props);
  return {
    state: props,
    manifest,
    dependencies: [liveApp],
  };
}

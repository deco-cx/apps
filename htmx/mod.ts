import { App, FnContext } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<Props, Manifest>;

export interface Props {
  /** @default 1.9.11 */
  version?: string;

  /** @defaul https://cdn.jsdelivr.net/npm  */
  cdn?: string;
}

/**
 * @title HTMX
 * @description high power tools for HTML.
 * @category Frameworks
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/htmx/logo.png
 */
export default function Site(state: Props): App<Manifest, Props> {
  return { state, manifest };
}

import { App, FnContext } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<Props, Manifest>;

export interface Props {
  /** @default 1.9.11 */
  version?: string;

  /** @defaul https://cdn.jsdelivr.net/npm  */
  cdn?: string;
}

/** @title HTMX */
export default function Site(state: Props): App<Manifest, Props> {
  return { state, manifest };
}

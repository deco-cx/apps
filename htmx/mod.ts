import { App, FnContext } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<Props, Manifest>;

export type Extension =
  | "ajax-header"
  | "alpine-morph"
  | "class-tools"
  | "client-side-templates"
  | "debug"
  | "event-header"
  | "head-support"
  | "include-vals"
  | "json-enc"
  | "idiomorph"
  | "loading-states"
  | "method-override"
  | "morphdom-swap"
  | "multi-swap"
  | "path-deps"
  | "preload"
  | "remove-me"
  | "response-targets"
  | "restored"
  | "server-sent-events"
  | "web-sockets"
  | "path-params";

export interface Props {
  /** @default 1.9.11 */
  version?: string;

  /** @defaul https://cdn.jsdelivr.net/npm  */
  cdn?: string;

  /** @title HTMX extensions to include */
  extensions?: Extension[];
}

/**
 * @title HTMX
 * @description high power tools for HTML.
 * @category Frameworks
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/htmx/logo.png
 */
export default function Site(state: Props): App<Manifest, Required<Props>> {
  return {
    state: {
      version: state.version ?? "1.9.11",
      cdn: state.cdn ?? "https://cdn.jsdelivr.net/npm",
      extensions: state.extensions ?? [],
    },
    manifest,
  };
}

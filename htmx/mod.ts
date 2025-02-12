import { Markdown } from "../decohub/components/Markdown.tsx";
import { PreviewContainer } from "../utils/preview.tsx";
import manifest, { Manifest } from "./manifest.gen.ts";
import { type App, type FnContext } from "@deco/deco";
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
  | "ws"
  | "path-params"
  | "sse";
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
      version: state.version ?? "1.9.12",
      cdn: state.cdn ?? "https://cdn.jsdelivr.net/npm",
      extensions: state.extensions ?? [],
    },
    manifest,
  };
}
export const preview = async () => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewContainer,
    props: {
      name: "HTMX",
      owner: "deco.cx",
      description: "High power tools for HTML",
      logo: "https://raw.githubusercontent.com/deco-cx/apps/main/htmx/logo.png",
      images: [],
      tabs: [
        {
          title: "About",
          content: markdownContent(),
        },
      ],
    },
  };
};

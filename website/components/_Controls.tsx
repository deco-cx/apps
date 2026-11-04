import { Head } from "$fresh/runtime.ts";
import { Page } from "../../commerce/types.ts";
import { useScriptAsDataURI } from "@deco/deco/hooks";
import { type Flag, type Site } from "@deco/deco";
interface Live {
  page?: Page;
  site: Site;
  flags: Flag[];
  avoidRedirectingToEditor?: boolean;
  trustedOrigins: string[];
}
interface Props {
  site: Site;
  page?: Page;
  flags?: Flag[];
  avoidRedirectingToEditor?: boolean;
}
type EditorEvent = {
  type: "editor::inject";
  args: {
    script: string;
  };
};
/**
 * Origins allowed to drive a rendered page through `postMessage` (the deco
 * admin and studio editors embed sites in an iframe and talk to them this way).
 * `http://localhost` / `http://127.0.0.1` on any port are always allowed for
 * local development. Self-hosted editors can extend the list with a
 * comma-separated `DECO_EDITOR_TRUSTED_ORIGINS`.
 */
const TRUSTED_EDITOR_ORIGINS = [
  "https://admin.deco.cx",
  "https://deco.cx",
  "https://www.deco.cx",
  "https://play.deco.cx",
  "https://admin-cx.deco.page",
  "https://decocms.com",
  "https://www.decocms.com",
  "https://studio.decocms.com",
  "https://studio-stg.decocms.com",
  "https://staging.decocms.com",
  ...(Deno.env.get("DECO_EDITOR_TRUSTED_ORIGINS")?.split(",") ?? [])
    .map((origin) => origin.trim())
    .filter(Boolean),
];
export const snippet = (live: Live) => {
  const onKeydown = (event: KeyboardEvent) => {
    // in case loaded in iframe, avoid redirecting to editor while in editor
    if (globalThis.window !== globalThis.window.parent) {
      return;
    }
    // Disable going to admin while input it being typed
    if (event.target !== document.body) {
      return;
    }
    if (event.defaultPrevented) {
      return;
    }
    if (
      (event.ctrlKey && event.shiftKey && event.key === "E") ||
      event.key === "."
    ) {
      event.preventDefault();
      event.stopPropagation();
      const pathname =
        `/choose-editor?site=${globalThis.window.LIVE.site.name}&domain=${globalThis.window.location.origin}&pageId=${globalThis.window.LIVE.page.id}`;
      const href = new URL(pathname, "https://admin.deco.cx");
      href.searchParams.set(
        "path",
        encodeURIComponent(
          `${globalThis.window.location.pathname}${globalThis.window.location.search}`,
        ),
      );
      href.searchParams.set(
        "pathTemplate",
        encodeURIComponent(globalThis.window.LIVE.page.pathTemplate || "/*"),
      );
      if ((event.ctrlKey || event.metaKey) && event.key === ".") {
        globalThis.window.open(href, "_blank");
        return;
      }
      globalThis.window.location.href = `${href}`;
    }
  };
  const isTrustedOrigin = (origin: string) => {
    if (live.trustedOrigins.includes(origin)) {
      return true;
    }
    try {
      const { protocol, hostname } = new URL(origin);
      return protocol === "http:" &&
        (hostname === "localhost" || hostname === "127.0.0.1");
    } catch {
      return false;
    }
  };
  const onMessage = (event: MessageEvent<EditorEvent>) => {
    // Only the editor embedding this page may drive it: a window obtained via
    // window.open or any other frame must never reach `editor::inject`.
    if (
      globalThis.window === globalThis.window.parent ||
      event.source !== globalThis.window.parent
    ) {
      return;
    }
    if (!isTrustedOrigin(event.origin)) {
      return;
    }
    const { data } = event;
    switch (data?.type) {
      case "editor::inject": {
        return eval(data.args.script);
      }
    }
  };
  /** Setup global variables */
  globalThis.window.LIVE = { ...globalThis.window.LIVE, ...live };
  /** Setup listeners */
  if (!live.avoidRedirectingToEditor) {
    document.body.addEventListener("keydown", onKeydown);
  }
  // navigate to admin when user clicks ctrl+shift+e
  // focus element when inside admin
  addEventListener("message", onMessage);
};
function LiveControls(
  { site, page, flags = [], avoidRedirectingToEditor }: Props,
) {
  return (
    <Head>
      <script
        defer
        src={useScriptAsDataURI(snippet, {
          page,
          site,
          flags,
          avoidRedirectingToEditor,
          trustedOrigins: TRUSTED_EDITOR_ORIGINS,
        })}
      />
    </Head>
  );
}
export default LiveControls;

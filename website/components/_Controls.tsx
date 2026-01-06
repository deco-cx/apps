import { Head } from "$fresh/runtime.ts";
import { Page } from "../../commerce/types.ts";
import { useScriptAsDataURI } from "@deco/deco/hooks";
import { type Flag, type Site } from "@deco/deco";
interface Live {
  page?: Page;
  site: Site;
  flags: Flag[];
  avoidRedirectingToEditor?: boolean;
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
const snippet = (live: Live) => {
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
  const onMessage = (event: MessageEvent<EditorEvent>) => {
    const { data } = event;
    switch (data.type) {
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
        })}
      />
    </Head>
  );
}
export default LiveControls;

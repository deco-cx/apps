import { Head } from "$fresh/runtime.ts";
import { context } from "deco/live.ts";
import type { Flag, Site } from "deco/types.ts";
import { DomInspectorActivators } from "https://deno.land/x/inspect_vscode@0.2.1/inspector.ts";
import { DomInspector } from "https://deno.land/x/inspect_vscode@0.2.1/mod.ts";
import { Page } from "../../commerce/types.ts";
import { scriptAsDataURI } from "../../utils/dataURI.ts";

const IS_LOCALHOST = context.deploymentId === undefined;

interface Live {
  page?: Page;
  site: Site;
  flags: Flag[];
  play: boolean;
}

interface Props {
  site: Site;
  page?: Page;
  flags?: Flag[];
}

type EditorEvent = {
  type: "editor::inject";
  args: { script: string };
};

const domInspectorModule = IS_LOCALHOST
  ? `
const DomInspectorActivators = {
  Backquote: {
    label: "\` (backtick) or Ctrl + X",
    matchEvent: (event) => event.code === "Backquote" || (event.ctrlKey && event.key === "x"),
  },
};
${DomInspector.toString()}`
  : "";

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

  //@ts-ignore: "DomInspector not available"
  const inspector = typeof DomInspector !== "undefined" &&
    //@ts-ignore: "DomInspector not available"
    new DomInspector(document.body, {
      outline: "1px dashed #2fd080",
      backgroundColor: "rgba(47, 208, 128, 0.33)",
      backgroundBlendMode: "multiply",
      activator: DomInspectorActivators.Backquote,
      path: "/live/inspect",
    });

  /** Setup global variables */
  globalThis.window.LIVE = { ...globalThis.window.LIVE, ...live };

  /** Setup listeners */

  // navigate to admin when user clicks ctrl+shift+e
  document.body.addEventListener("keydown", onKeydown);

  // focus element when inside admin
  addEventListener("message", onMessage);
};

function LiveControls({ site, page, flags = [] }: Props) {
  return (
    <Head>
      <script
        defer
        src={scriptAsDataURI(snippet, {
          page,
          site,
          flags,
          play: !!context.play,
        })}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: domInspectorModule,
        }}
      />
    </Head>
  );
}

export default LiveControls;

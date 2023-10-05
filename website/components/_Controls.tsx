import { Head } from "$fresh/runtime.ts";
import type { Flag, Site } from "deco/types.ts";
import { context } from "deco/live.ts";

interface Page {
  id: string | number;
  pathTemplate?: string;
}

declare global {
  interface Window {
    LIVE: {
      page: Page;
      site: Site;
      flags?: Flag[];
      play?: boolean;
    };
  }
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

const main = () => {
  const onKeydown = (event: KeyboardEvent) => {
    // in case loaded in iframe, avoid redirecting to editor while in editor
    if (window !== window.parent) {
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

      const pathname = window.LIVE.play
        ? `/play/blocks/${window.LIVE.page.id}?domain=${window.location.origin}`
        : `/admin/sites/${window.LIVE.site.name}/blocks/${window.LIVE.page.id}`;

      const href = new URL(pathname, "https://deco.cx");

      href.searchParams.set(
        "path",
        encodeURIComponent(
          `${window.location.pathname}${window.location.search}`,
        ),
      );
      href.searchParams.set(
        "pathTemplate",
        encodeURIComponent(window.LIVE.page.pathTemplate || "/*"),
      );
      window.location.href = `${href}`;
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
  window.LIVE = {
    ...window.LIVE,
    ...JSON.parse(document.getElementById("__DECO_STATE")!.innerText),
  };

  /** Setup listeners */

  // navigate to admin when user clicks ctrl+shift+e
  document.body.addEventListener("keydown", onKeydown);

  // focus element when inside admin
  addEventListener("message", onMessage);
};

function LiveControls({ site, page, flags }: Props) {
  return (
    <>
      <Head>
        <script
          type="application/json"
          id="__DECO_STATE"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ page, site, flags, play: context.play }),
          }}
        />
        <script
          type="module"
          dangerouslySetInnerHTML={{ __html: `(${main})()` }}
        />
      </Head>
    </>
  );
}

export default LiveControls;

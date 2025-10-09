import { Head } from "$fresh/runtime.ts";
import { useScriptAsDataURI } from "@deco/deco/hooks";
import { DEFAULT_ANALYTICS_SCRIPT_URL } from "../loaders/analyticsScript.ts";

export interface Props {
  /**
   * @description collector address to use
   */
  collectorAddress?: string;
  /**
   * @description static script to use
   */
  staticScriptUrl?: string;
}

declare global {
  interface Window {
    stonks: {
      event: (
        name: string,
        params: Record<string, string | boolean>,
      ) => void;
      view: (
        params: Record<string, string | boolean>,
      ) => void;
    };
  }
}

const oneDollarSnippet = () => {
  // Flags and additional dimentions
  const props: Record<string, string> = {};
  const trackPageview = () => globalThis.window.stonks?.view?.(props);
  // Attach pushState and popState listeners
  const originalPushState = history.pushState;
  if (originalPushState) {
    history.pushState = function () {
      // @ts-ignore monkey patch
      originalPushState.apply(this, arguments);
      trackPageview();
    };
    addEventListener("popstate", trackPageview);
  }
  // 2000 bytes limit
  const truncate = (str: string) => `${str}`.slice(0, 990);

  globalThis.window.DECO.events.subscribe((event) => {
    if (!event || event.name !== "deco") {
      return;
    }
    if (event.params) {
      const { flags, page } = event.params;
      if (Array.isArray(flags)) {
        for (const flag of flags) {
          props[flag.name] = truncate(flag.value.toString());
        }
      }
      props["pageId"] = truncate(`${page.id}`);
    }
    trackPageview();
  })();

  globalThis.window.DECO.events.subscribe((event) => {
    if (!event) {
      return;
    }
    const { name, params } = event;
    if (!name || !params || name === "deco") {
      return;
    }
    const values = { ...props };
    for (const key in params) {
      const value = params[key];
      if (value !== null && value !== undefined) {
        values[key] = truncate(
          typeof value !== "object" ? value : JSON.stringify(value),
        );
      }
    }
    globalThis.window.stonks?.event?.(name, values);
  });
};

export const DEFAULT_COLLECTOR_ADDRESS = "https://d.lilstts.com/events";

/**
 * Renders Head elements that configure and load the analytics collector and inline tracking snippet.
 *
 * @param collectorAddress - Optional URL of the analytics collector; falls back to the default collector when omitted.
 * @param staticScriptUrl - Optional URL of the static analytics script to load; falls back to the bundled default when omitted.
 * @returns A Head element that dns-prefetches and preconnects to the collector, loads the analytics module script, and injects the inline tracking snippet.
 */
function Component({ collectorAddress, staticScriptUrl }: Props) {
  const collector = collectorAddress ?? DEFAULT_COLLECTOR_ADDRESS;
  const staticScript = staticScriptUrl ?? DEFAULT_ANALYTICS_SCRIPT_URL;

  return (
    <Head>
      <link rel="dns-prefetch" href={collector} />
      <link
        rel="preconnect"
        href={collector}
        crossOrigin="anonymous"
      />
      <script
        id="tracker"
        data-autocollect="false"
        data-hash-routing="true"
        data-url={collector}
        type="module"
        src={`/live/invoke/website/loaders/analyticsScript.ts?url=${staticScript}`}
      />
      <script defer src={useScriptAsDataURI(oneDollarSnippet)} />
    </Head>
  );
}
export default Component;
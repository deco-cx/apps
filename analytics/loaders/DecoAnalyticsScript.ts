import { getFlagsFromRequest } from "../../utils/cookie.ts";
import { Script } from "../../website/types.ts";
import { AppContext } from "../mod.ts";
import { scriptAsDataURI } from "../../utils/dataURI.ts";

export type Props = {
  defer?: boolean;
  domain?: string;
};

declare global {
  interface Window {
    plausible: (
      name: string,
      params: { props: Record<string, string | boolean> },
    ) => void;
  }
}

const snippet = (flags: Record<string, string | boolean>) => {
  const trackPageview = () =>
    globalThis.window.plausible?.("pageview", { props: flags });

  // First load
  trackPageview();

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
};

const loader = (
  props: Props,
  _req: Request,
  _ctx: AppContext,
): Script => {
  const transformReq = (req: Request) => {
    const dnsPrefetchLink =
      '<link rel="dns-prefetch" href="https://plausible.io/api/event" />';
    const preconnectLink =
      '<link rel="preconnect" href="https://plausible.io/api/event" crossorigin="anonymous" />';

    const _flags = getFlagsFromRequest(req);
    const flags: Record<string, string | boolean> = {};
    _flags.forEach((flag) => flags[flag.name] = flag.value);

    // if you want to test it local, add ".local" to src
    // example: /script.manual.local.js
    const plausibleScript = `<script ${
      props.defer ? "defer" : ""
    } data-exclude="/proxy" ${
      props.domain ? "data-domain=" + props.domain : ""
    } data-api="https://plausible.io/api/event" src="https://plausible.io/js/script.manual.hash.js"></script>`;

    const flagsScript = `<script defer src="${
      scriptAsDataURI(snippet, flags)
    }"></script>`;

    return dnsPrefetchLink + preconnectLink + plausibleScript + flagsScript;
  };
  return ({ src: transformReq });
};

export default loader;

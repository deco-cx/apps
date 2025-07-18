import { useScriptAsDataURI } from "@deco/deco/hooks";
import {
  DEFAULT_COLLECTOR_ADDRESS,
} from "../../website/components/OneDollarStats.tsx";
import { Script } from "../../website/types.ts";
import { type Flag } from "@deco/deco";
import { DEFAULT_ANALYTICS_SCRIPT_URL } from "../../website/loaders/analyticsScript.ts";

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

const snippet = () => {
  const parseCookies = (cookieString: string) => {
    const cookies: Record<string, string> = {};
    cookieString.split(";").forEach((cookie) => {
      const [key, value] = cookie.split("=").map((c) => c.trim());
      cookies[key] = value;
    });
    return cookies;
  };
  const tryOrDefault = <R>(fn: () => R, defaultValue: R) => {
    try {
      return fn();
    } catch {
      return defaultValue;
    }
  };
  const getFlagsFromCookies = (cookies: Record<string, string>) => {
    const flags: Flag[] = [];
    const segment = cookies["deco_segment"]
      ? tryOrDefault(
        () => JSON.parse(decodeURIComponent(atob(cookies["deco_segment"]))),
        {},
      )
      : {};
    segment.active?.forEach((flag: string) =>
      flags.push({ name: flag, value: true })
    );
    segment.inactiveDrawn?.forEach((flag: string) =>
      flags.push({ name: flag, value: false })
    );
    return flags;
  };
  const _flags = getFlagsFromCookies(parseCookies(document.cookie));
  const flags: Record<string, string | boolean> = {};
  _flags.forEach((flag) => flags[flag.name] = flag.value);
  const trackPageview = () => globalThis.window.stonks?.view?.(flags);
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

const loader = (props: Props): Script => {
  const transformReq = () => {
    const collector = props.collectorAddress ?? DEFAULT_COLLECTOR_ADDRESS;
    const staticScriptUrl = props.staticScriptUrl ??
      DEFAULT_ANALYTICS_SCRIPT_URL;
    const dnsPrefetchLink = `<link rel="dns-prefetch" href="${collector}" />`;
    const preconnectLink =
      `<link rel="preconnect" href="${collector}" crossorigin="anonymous" />`;
    const trackerScript = `<script
        id="tracker"
        data-autocollect="false"
        data-hash-routing="true"
        data-url="${collector}"
        src="/live/invoke/website/loaders/analyticsScript.ts?url=${staticScriptUrl}"
      ></script>`;

    const script = `<script defer src="${
      useScriptAsDataURI(snippet)
    }"></script>`;
    return dnsPrefetchLink + preconnectLink + trackerScript + script;
  };
  return ({ src: transformReq });
};
export default loader;

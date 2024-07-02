import { Head } from "$fresh/runtime.ts";
import { useScriptAsDataURI } from "deco/hooks/useScript.ts";
import { DECO_SEGMENT } from "deco/runtime/fresh/middlewares/3_main.ts";
import { Flag } from "deco/types.ts";
import { type AnalyticsEvent, type Deco } from "../../commerce/types.ts";

type EventHandler = (event?: AnalyticsEvent) => void | Promise<void>;

interface EventsAPI {
  dispatch: (event: unknown) => void;
  subscribe: (
    handler: EventHandler,
    options?: AddEventListenerOptions | boolean,
  ) => () => void;
}

declare global {
  interface Window {
    DECO_ANALYTICS: Record<
      string,
      // deno-lint-ignore no-explicit-any
      (action: string, eventType: string, props?: any) => void
    >;
    DECO_SITES_STD: { sendAnalyticsEvent: (event: unknown) => void };
    DECO: { events: EventsAPI };
    navigation: {
      activation: {
        from: string;
      };
    };
  }
}

/**
 * This function handles all ecommerce analytics events.
 * Add another ecommerce analytics modules here.
 */
const snippet = (
  { deco: { page }, segmentCookie, sendToClickHouse, siteId, siteName }: {
    deco: Deco;
    segmentCookie: string;
    sendToClickHouse?: boolean;
    siteId?: number;
    siteName?: string;
  },
) => {
  const cookie = document.cookie;
  const out: Record<string, string> = {};
  if (cookie !== null) {
    const c = cookie.split(";");
    for (const kv of c) {
      const [cookieKey, ...cookieVal] = kv.split("=");
      const key = cookieKey.trim();
      out[key] = cookieVal.join("=");
    }
  }

  const flags: Flag[] = [];
  if (out[segmentCookie]) {
    try {
      const segment = JSON.parse(decodeURIComponent(atob(out[segmentCookie])));
      segment.active?.forEach((flag: string) =>
        flags.push({ name: flag, value: true })
      );
      segment.inactiveDrawn?.forEach((flag: string) =>
        flags.push({ name: flag, value: false })
      );
    } catch {
      console.error("Error parsing deco_segment cookie");
    }
  }

  const target = new EventTarget();

  const dispatch: EventsAPI["dispatch"] = (event: unknown) => {
    target.dispatchEvent(new CustomEvent("analytics", { detail: event }));
  };

  const subscribe: EventsAPI["subscribe"] = (handler, opts) => {
    // deno-lint-ignore no-explicit-any
    const cb = ({ detail }: any) => handler(detail);

    handler({ name: "deco", params: { flags, page } });

    target.addEventListener("analytics", cb, opts);

    return () => {
      target.removeEventListener("analytics", cb, opts);
    };
  };

  globalThis.window.DECO_SITES_STD = { sendAnalyticsEvent: dispatch };
  globalThis.window.DECO = {
    ...globalThis.window.DECO,
    events: { dispatch, subscribe },
  };

  if (sendToClickHouse) {
    const trackPageview = () =>
      globalThis.window.DECO.events.dispatch({
        name: "pageview",
      });

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

    globalThis.window.DECO.events.subscribe((event) => {
      if (!event) return;

      const { name } = event;

      if (name === "deco") return;

      // Funções auxiliares para capturar informações dinâmicas
      function getDeviceType() {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return "mobile";
        if (/tablet/i.test(ua)) return "tablet";
        return "desktop";
      }

      function getBrowserName() {
        const ua = navigator.userAgent;
        if (/chrome|crios|crmo/i.test(ua)) return "Chrome";
        if (/firefox|fxios/i.test(ua)) return "Firefox";
        if (/safari/i.test(ua)) return "Safari";
        if (/msie|trident/i.test(ua)) return "Internet Explorer";
        if (/edge|edgios|edga/i.test(ua)) return "Edge";
        return "Unknown";
      }

      function getBrowserVersion() {
        const ua = navigator.userAgent;
        const browser = getBrowserName();
        let match;
        switch (browser) {
          case "Chrome":
            match = ua.match(/(?:chrome|crios|crmo)\/(\d+)/i);
            break;
          case "Firefox":
            match = ua.match(/(?:firefox|fxios)\/(\d+)/i);
            break;
          case "Safari":
            match = ua.match(/version\/(\d+)/i);
            break;
          case "Internet Explorer":
            match = ua.match(/(?:msie |rv:)(\d+)/i);
            break;
          case "Edge":
            match = ua.match(/(?:edge|edgios|edga)\/(\d+)/i);
            break;
        }
        return match ? match[1] : "Unknown";
      }

      function getOperatingSystem() {
        const ua = navigator.userAgent;
        if (/windows/i.test(ua)) return "Windows";
        if (/macintosh|mac os x/i.test(ua)) return "Mac OS";
        if (/linux/i.test(ua)) return "Linux";
        if (/android/i.test(ua)) return "Android";
        if (/ios|iphone|ipad|ipod/i.test(ua)) return "iOS";
        return "Unknown";
      }

      function getOSVersion() {
        const os = getOperatingSystem();
        const ua = navigator.userAgent;
        let match;
        switch (os) {
          case "Windows":
            match = ua.match(/Windows NT (\d+\.\d+)/);
            break;
          case "Mac OS":
            match = ua.match(/Mac OS X (\d+_\d+)/);
            break;
          case "Android":
            match = ua.match(/Android (\d+\.\d+)/);
            break;
          case "iOS":
            match = ua.match(/OS (\d+_\d+)/);
            break;
        }
        return match ? match[1].replace("_", ".") : "Unknown";
      }

      function getUrlParam(param: string) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
      }

      function getReferrerSource(referrer: string) {
        if (!referrer) return "direct";
        const referrerUrl = new URL(referrer);
        if (referrerUrl.hostname.includes("google")) return "google";
        if (referrerUrl.hostname.includes("facebook")) return "facebook";
        // Adicione outras fontes conforme necessário
        return "other";
      }

      const mock = {
        hostname: globalThis.window.location.origin,
        site_id: siteId,
        site_name: siteName,
        user_id: undefined, // get server side
        session_id: undefined, // get server side
        event_name: name,
        start_time: new Date().toISOString(),
        timestamp: undefined, // get server side
        pathname: globalThis.window.location.pathname,
        navigation_from: globalThis.window.navigation.activation.from,
        entry_meta: {
          key: ["key"],
          value: ["value"],
        }, // fill with flags

        utm_medium: getUrlParam("utm_medium"),
        utm_source: getUrlParam("utm_source"),
        utm_campaign: getUrlParam("utm_campaign"),
        utm_content: getUrlParam("utm_content"),
        utm_term: getUrlParam("utm_term"),

        referrer: document.referrer,
        referrer_source: getReferrerSource(document.referrer), // benchmark: plausible

        ip_city: undefined, // get server side
        ip_continent: undefined, // get server side
        ip_country: undefined, // get server side
        ip_region: undefined, // get server side
        ip_region_code: undefined, // get server side
        ip_timezone: undefined, // get server side
        ip_lat: undefined, // get server side
        ip_long: undefined, // get server side

        screen_size: `${window.screen.width}x${window.screen.height}`,

        device: getDeviceType(),
        operating_system: getOperatingSystem(),
        operating_system_version: getOSVersion(),
        browser: getBrowserName(),
        browser_version: getBrowserVersion(),
      };

      fetch("https://juggler.deco.site/live/invoke/site/actions/sendEvent.ts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: mock,
        }),
      });
    });

    // first pageview
    trackPageview();
  }
};

function Events(
  { deco, sendToClickHouse, siteId, siteName }: {
    deco: Deco;
    sendToClickHouse?: boolean;
    siteId?: number;
    siteName?: string;
  },
) {
  return (
    <Head>
      <script
        defer
        id="deco-events"
        src={useScriptAsDataURI(snippet, {
          deco,
          segmentCookie: DECO_SEGMENT,
          sendToClickHouse,
          siteId,
          siteName,
        })}
      />
    </Head>
  );
}

export default Events;

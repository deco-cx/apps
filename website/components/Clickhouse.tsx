import { Head } from "$fresh/runtime.ts";
import { encryptToHex } from "../utils/crypto.ts";
import { useScriptAsDataURI } from "@deco/deco/hooks";
declare global {
  interface Window {
    navigation: {
      activation: {
        from: string;
      };
    };
  }
}
interface Event {
  hostname: string;
  site_id: string | number;
  site_name: string;
  user_id?: string;
  session_id?: string;
  event_name: string;
  start_time: string;
  timestamp?: string;
  pathname: string;
  navigation_from: string;
  entry_meta: {
    key: string[];
    value: string[];
  };
  utm_medium?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referrer: string;
  referrer_source?: string;
  ip_city?: string;
  ip_continent?: string;
  ip_country?: string;
  ip_region?: string;
  ip_region_code?: string;
  ip_timezone?: string;
  ip_lat?: string;
  ip_long?: string;
  screen_size: string;
  device: string;
  operating_system: string;
  operating_system_version: string;
  browser: string;
  browser_version: string;
}
const SERVICE_ENDPOINT = Deno.env.get("EVENT_COLLECTOR") ??
  "https://juggler.deco.site/live/invoke/site/actions/sendEvent.ts";
function getDailySalt(): string {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}
export const generateUserId = async (
  sitename: string,
  ipAddress: string,
  userAgent: string,
) => {
  const daily_salt = getDailySalt();
  const data = daily_salt + sitename + ipAddress + userAgent;
  return await encryptToHex(data);
};
export const generateSessionId = (): string => {
  return crypto.randomUUID();
};
/**
 * This function handles all ecommerce analytics events.
 * Add another ecommerce analytics modules here.
 */
const snippet = ({ siteId, siteName, serviceEndpoint, userId, sessionId }: {
  siteId?: number;
  siteName?: string;
  serviceEndpoint: string;
  userId: string;
  sessionId: string;
}) => {
  const props: Record<string, string> = {};
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
    if (name === "deco") {
      return;
    }
    const values = { ...props };
    for (const key in params) {
      // @ts-expect-error somehow typescript bugs
      const value = params[key];
      if (value !== null && value !== undefined) {
        values[key] = truncate(
          typeof value !== "object" ? value : JSON.stringify(value),
        );
      }
    }
    // Funções auxiliares para capturar informações dinâmicas
    function getDeviceType() {
      const ua = navigator.userAgent;
      if (/mobile/i.test(ua)) {
        return "mobile";
      }
      if (/tablet/i.test(ua)) {
        return "tablet";
      }
      return "desktop";
    }
    function getBrowserName() {
      const ua = navigator.userAgent;
      if (/chrome|crios|crmo/i.test(ua)) {
        return "Chrome";
      }
      if (/firefox|fxios/i.test(ua)) {
        return "Firefox";
      }
      if (/safari/i.test(ua)) {
        return "Safari";
      }
      if (/msie|trident/i.test(ua)) {
        return "Internet Explorer";
      }
      if (/edge|edgios|edga/i.test(ua)) {
        return "Edge";
      }
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
      if (/windows/i.test(ua)) {
        return "Windows";
      }
      if (/macintosh|mac os x/i.test(ua)) {
        return "Mac OS";
      }
      if (/linux/i.test(ua)) {
        return "Linux";
      }
      if (/android/i.test(ua)) {
        return "Android";
      }
      if (/ios|iphone|ipad|ipod/i.test(ua)) {
        return "iOS";
      }
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
      if (!referrer) {
        return "direct";
      }
      const referrerUrl = new URL(referrer);
      if (referrerUrl.hostname.includes("google")) {
        return "google";
      }
      if (referrerUrl.hostname.includes("facebook")) {
        return "facebook";
      }
      // Adicione outras fontes conforme necessário
      return "other";
    }
    const mock: Event = {
      hostname: globalThis.window.location.origin,
      site_id: siteId || "",
      site_name: siteName || "",
      user_id: userId, // get server side
      session_id: sessionId, // get server side
      event_name: name,
      start_time: new Date().toISOString(),
      timestamp: undefined, // get server side
      pathname: globalThis.window.location.pathname +
        (window.location.hash ?? ""),
      navigation_from: globalThis.window.navigation.activation.from,
      entry_meta: {
        key: Object.keys(values),
        value: Object.values(values),
      },
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
    fetch(serviceEndpoint, {
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
};
function Clickhouse({ siteId, siteName, userId, sessionId }: {
  siteId?: number;
  siteName?: string;
  userId: string;
  sessionId: string;
}) {
  return (
    <Head>
      <script
        defer
        id="deco-events"
        src={useScriptAsDataURI(snippet, {
          siteId,
          siteName,
          serviceEndpoint: SERVICE_ENDPOINT,
          userId,
          sessionId,
        })}
      />
    </Head>
  );
}
export default Clickhouse;

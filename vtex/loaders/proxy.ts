import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";

const PATHS_TO_PROXY = [
  "/account",
  "/checkout",
  "/checkout/*",
  "/files/*",
  "/assets/*",
  "/arquivos/*",
  "/account/*",
  "/login",
  "/no-cache/*",
  "/api/*",
  "/logout",
  "/_secure/account",
  "/XMLData/*",
  "/_v/*",
];
const decoSiteMapUrl = "/sitemap/deco.xml";

const buildProxyRoutes = (
  { publicUrl, extraPaths, includeSiteMap, generateDecoSiteMap, includeScriptsToHead }: {
    publicUrl?: string;
    extraPaths: string[];
    includeSiteMap?: string[];
    generateDecoSiteMap?: boolean;
    includeScriptsToHead?: {
      includes: string[];
      includePlausible: boolean;
    };
  },
) => {
  if (!publicUrl) {
    return [];
  }

  try {
    const hostname = (new URL(
      publicUrl?.startsWith("http") ? publicUrl : `https://${publicUrl}`,
    )).hostname;

    // Rejects TLD mystore.com, which VTEX doesn't support it carrefour.com.br / CNAME
    if (!hostname || hostname.split(".").length <= 2) {
      throw new Error(`Invalid hostname from '${publicUrl}'`);
    }

    // TODO @lucis: Fix the proxy, MITM

    // const urlToProxy = `https://${hostname}.cdn.vtex.com`;
    const urlToProxy = `https://${hostname}`;
    const hostToUse = hostname;

    const link1 =
      '<link rel="dns-prefetch" href="https://plausible.io/api/event">';
    const link2 =
      '<link rel="preconnect" href="https://plausible.io/api/event" crossorigin="anonymous">';
    const plausibleScript =
      '<script data-exclude="/proxy" data-api="https://plausible.io/api/event">!function(){"use strict";var l=window.location,s=window.document,u=s.currentScript,c=u.getAttribute("data-api")||new URL(u.src).origin+"/api/event";function p(t,e){t&&console.warn("Ignoring Event: "+t),e&&e.callback&&e.callback()}function t(t,e){if(/^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(l.hostname)||"file:"===l.protocol)return p("localhost",e);if(window._phantom||window.__nightmare||window.navigator.webdriver||window.Cypress)return p(null,e);try{if("true"===window.localStorage.plausible_ignore)return p("localStorage flag",e)}catch(t){}var i=u&&u.getAttribute("data-include"),n=u&&u.getAttribute("data-exclude");if("pageview"===t){i=!i||i.split(",").some(a),n=n&&n.split(",").some(a);if(!i||n)return p("exclusion rule",e)}function a(t){return l.pathname.match(new RegExp("^"+t.trim().replace(/\*\*/g,".*").replace(/([^\.])\*/g,"$1[^\\s/]*")+"/?$"))}var i={},n=(i.n=t,i.u=l.href,i.d=((w,d)=>{const h=w.location.hostname;return h.replace(/^www./,"")})(window,document),i.r=s.referrer||null,e&&e.meta&&(i.m=JSON.stringify(e.meta)),e&&e.props&&(i.p=e.props),u.getAttributeNames().filter(function(t){return"event-"===t.substring(0,6)})),r=i.p||{},o=(n.forEach(function(t){var e=t.replace("event-",""),t=u.getAttribute(t);r[e]=r[e]||t}),i.p=r,new XMLHttpRequest);o.open("POST",c,!0),o.setRequestHeader("Content-Type","text/plain"),o.send(JSON.stringify(i)),o.onreadystatechange=function(){4===o.readyState&&e&&e.callback&&e.callback()}}var e=window.plausible&&window.plausible.q||[];window.plausible=t;for(var i,n=0;n<e.length;n++)t.apply(this,e[n]);function a(){i!==l.pathname&&(i=l.pathname,t("pageview"))}var r,o=window.history;o.pushState&&(r=o.pushState,o.pushState=function(){r.apply(this,arguments),a()},window.addEventListener("popstate",a)),"prerender"===s.visibilityState?s.addEventListener("visibilitychange",function(){i||"visible"!==s.visibilityState||a()}):a()}();</script>';

    includeScriptsToHead!.includes = [link1, link2, plausibleScript];
    includeScriptsToHead!.includePlausible = true;

    const routeFromPath = (pathTemplate: string): Route => ({
      pathTemplate,
      handler: {
        value: {
          __resolveType: "website/handlers/proxy.ts",
          url: urlToProxy,
          host: hostToUse,
          includeScriptsToHead: includeScriptsToHead,
        },
      },
    });
    const routesFromPaths = [...PATHS_TO_PROXY, ...extraPaths].map(
      routeFromPath,
    );

    const [include, routes] = generateDecoSiteMap
      ? [[...(includeSiteMap ?? []), decoSiteMapUrl], [{
        pathTemplate: decoSiteMapUrl,
        handler: {
          value: {
            __resolveType: "website/handlers/sitemap.ts",
          },
        },
      }]]
      : [includeSiteMap, []];

    return [
      ...routes,
      {
        pathTemplate: "/sitemap.xml",
        handler: {
          value: {
            include,
            __resolveType: "vtex/handlers/sitemap.ts",
          },
        },
      },
      {
        pathTemplate: "/sitemap/*",
        handler: {
          value: {
            __resolveType: "vtex/handlers/sitemap.ts",
          },
        },
      },
      ...routesFromPaths,
    ];
  } catch (e) {
    console.log("Error parsing publicUrl from configVTEX");
    console.error(e);
    return [];
  }
};

export interface Props {
  extraPathsToProxy?: string[];
  /**
   * @title Other site maps to include
   */
  includeSiteMap?: string[];
  /**
   * @title If deco site map should be exposed at /deco-sitemap.xml
   */
  generateDecoSiteMap?: boolean;
  /**
   * @title Scripts to include on Html
   */
  includeScriptsToHead?: {
    includes: string[];
    includePlausible: boolean;
  };
}

/**
 * @title VTEX Proxy Routes
 */
function loader(
  { extraPathsToProxy = [], includeSiteMap = [], generateDecoSiteMap = true, includeScriptsToHead = { includes: [], includePlausible: false} }:
    Props,
  _req: Request,
  ctx: AppContext,
): Route[] {
  return buildProxyRoutes({
    generateDecoSiteMap,
    includeSiteMap,
    publicUrl: ctx.publicUrl,
    extraPaths: extraPathsToProxy,
    includeScriptsToHead,
  });
}

export default loader;

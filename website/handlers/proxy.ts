import { isFreshCtx } from "deco/handlers/fresh.ts";
import { DecoSiteState } from "deco/mod.ts";
import { Handler } from "std/http/mod.ts";
import { proxySetCookie } from "../../utils/cookie.ts";

const HOP_BY_HOP = [
  "Keep-Alive",
  "Transfer-Encoding",
  "TE",
  "Connection",
  "Trailer",
  "Upgrade",
  "Proxy-Authorization",
  "Proxy-Authenticate",
];

const noTrailingSlashes = (str: string) =>
  str.at(-1) === "/" ? str.slice(0, -1) : str;
const sanitize = (str: string) => str.startsWith("/") ? str : `/${str}`;
const removeCFHeaders = (headers: Headers) => {
  headers.forEach((_value, key) => {
    if (key.startsWith("cf-")) {
      headers.delete(key);
    }
  });
};

const proxyTo = (
  { proxyUrl: rawProxyUrl, basePath, host: hostToUse, customHeaders = [] }: {
    proxyUrl: string;
    basePath?: string;
    host?: string;
    customHeaders?: Header[];
  },
): Handler =>
async (req, _ctx) => {
  const url = new URL(req.url);
  const proxyUrl = noTrailingSlashes(rawProxyUrl);
  const qs = url.searchParams.toString();
  const path = basePath && basePath.length > 0
    ? url.pathname.replace(basePath, "")
    : url.pathname;

  const to = new URL(
    `${proxyUrl}${sanitize(path)}?${qs}`,
  );

  const headers = new Headers(req.headers);
  HOP_BY_HOP.forEach((h) => headers.delete(h));

  if (isFreshCtx<DecoSiteState>(_ctx)) {
    _ctx?.state?.monitoring?.logger?.log?.("proxy received headers", headers);
  }
  removeCFHeaders(headers); // cf-headers are not ASCII-compliant
  if (isFreshCtx<DecoSiteState>(_ctx)) {
    _ctx?.state?.monitoring?.logger?.log?.("proxy sent headers", headers);
  }

  headers.set("origin", req.headers.get("origin") ?? url.origin);
  headers.set("host", hostToUse ?? to.host);
  headers.set("x-forwarded-host", url.host);

  for (const { key, value } of customHeaders) {
    headers.set(key, value);
  }

  const response = await fetch(to, {
    headers,
    redirect: "manual",
    method: req.method,
    body: req.body,
  });

  const contentType = response.headers.get("Content-Type");

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  let newBodyStream = null;

  if (contentType?.includes("text/html")) {
    const link1 =
      '<link rel="dns-prefetch" href="https://plausible.io/api/event">';
    const link2 =
      '<link rel="preconnect" href="https://plausible.io/api/event" crossorigin="anonymous">';
    const plausibleScript =
      '<script data-exclude="/proxy" data-api="https://plausible.io/api/event">!function(){"use strict";var l=window.location,s=window.document,u=s.currentScript,c=u.getAttribute("data-api")||new URL(u.src).origin+"/api/event";function p(t,e){t&&console.warn("Ignoring Event: "+t),e&&e.callback&&e.callback()}function t(t,e){if(/^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(l.hostname)||"file:"===l.protocol)return p("localhost",e);if(window._phantom||window.__nightmare||window.navigator.webdriver||window.Cypress)return p(null,e);try{if("true"===window.localStorage.plausible_ignore)return p("localStorage flag",e)}catch(t){}var i=u&&u.getAttribute("data-include"),n=u&&u.getAttribute("data-exclude");if("pageview"===t){i=!i||i.split(",").some(a),n=n&&n.split(",").some(a);if(!i||n)return p("exclusion rule",e)}function a(t){return l.pathname.match(new RegExp("^"+t.trim().replace(/\*\*/g,".*").replace(/([^\.])\*/g,"$1[^\\s/]*")+"/?$"))}var i={},n=(i.n=t,i.u=l.href,i.d=((w,d)=>{const h=w.location.hostname;return h.replace(/^www./,"")})(window,document),i.r=s.referrer||null,e&&e.meta&&(i.m=JSON.stringify(e.meta)),e&&e.props&&(i.p=e.props),u.getAttributeNames().filter(function(t){return"event-"===t.substring(0,6)})),r=i.p||{},o=(n.forEach(function(t){var e=t.replace("event-",""),t=u.getAttribute(t);r[e]=r[e]||t}),i.p=r,new XMLHttpRequest);o.open("POST",c,!0),o.setRequestHeader("Content-Type","text/plain"),o.send(JSON.stringify(i)),o.onreadystatechange=function(){4===o.readyState&&e&&e.callback&&e.callback()}}var e=window.plausible&&window.plausible.q||[];window.plausible=t;for(var i,n=0;n<e.length;n++)t.apply(this,e[n]);function a(){i!==l.pathname&&(i=l.pathname,t("pageview"))}var r,o=window.history;o.pushState&&(r=o.pushState,o.pushState=function(){r.apply(this,arguments),a()},window.addEventListener("popstate",a)),"prerender"===s.visibilityState?s.addEventListener("visibilitychange",function(){i||"visible"!==s.visibilityState||a()}):a()}();</script>';

    let accHtml: string | undefined = "";
    const insertPlausible = new TransformStream({
      async transform(chunk, controller) {
        let newChunk = await chunk;
        if (accHtml != undefined) {
          for (let i = 0; i < chunk.length; i++) {
            accHtml = accHtml.slice(-5) + decoder.decode(chunk.slice(i, i + 1));
            
            if (accHtml == "<head>") {
              accHtml = "";

              accHtml += decoder.decode(chunk.slice(0, i + 1));
              accHtml += link1;
              accHtml += link2;
              accHtml += plausibleScript;
              accHtml += decoder.decode(chunk.slice(i + 1, chunk.length));

              newChunk = encoder.encode(accHtml);
              accHtml = undefined;
              break;
            }
          }
        }
        controller.enqueue(newChunk);
      },
    });
    await response.body!.pipeThrough(insertPlausible);
    newBodyStream = insertPlausible.readable;
  }

  // Change cookies domain
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("set-cookie");

  proxySetCookie(response.headers, responseHeaders, url);

  if (response.status >= 300 && response.status < 400) { // redirect change location header
    const location = responseHeaders.get("location");
    if (location) {
      responseHeaders.set(
        "location",
        location.replace(proxyUrl, url.origin),
      );
    }
  }
  return new Response(newBodyStream === null ? response.body : newBodyStream, {
    status: response.status,
    headers: responseHeaders,
  });
};

/**
 * @title {{{key}}} - {{{value}}}
 */
export interface Header {
  /**
   * @title Key
   */
  key: string;
  /**
   * @title Value
   */
  value: string;
}

export interface Props {
  /**
   * @description the proxy url.
   * @example https://bravtexfashionstore.vtexcommercestable.com.br/api
   */
  url: string;
  /**
   * @description the base path of the url.
   * @example /api
   */
  basePath?: string;

  /**
   * @description Host that should be used when proxying the request
   */
  host?: string;
  /**
   * @description custom headers
   */
  customHeaders?: Header[];
}

/**
 * @title Proxy
 * @description Proxies request to the target url.
 */
export default function Proxy({ url, basePath, host, customHeaders }: Props) {
  return proxyTo({ proxyUrl: url, basePath, host, customHeaders });
}

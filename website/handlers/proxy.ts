import { proxySetCookie } from "../../utils/cookie.ts";
import { removeDirtyCookies as removeDirtyCookiesFn } from "../../utils/normalize.ts";
import { Script } from "../types.ts";
import { isFreshCtx } from "./fresh.ts";
import { type DecoSiteState } from "@deco/deco";
type Handler = Deno.ServeHandler;
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
export const removeCFHeaders = (headers: Headers) => {
  headers.forEach((_value, key) => {
    if (key.startsWith("cf-")) {
      headers.delete(key);
    }
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
export interface TextReplace {
  from: string;
  to: string;
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
  /**
   * @description Scripts to be included in the head of the html
   */
  includeScriptsToHead?: {
    includes?: Script[];
  };
  /**
   * @description follow redirects
   * @default 'manual'
   */
  redirect?: "manual" | "follow";
  avoidAppendPath?: boolean;
  replaces?: TextReplace[];
  /**
   * @description remove cookies that have non-ASCII characters and some symbols
   * @default false
   */
  removeDirtyCookies?: boolean;
  excludeHeaders?: string[];
}
/**
 * @title Proxy
 * @description Proxies request to the target url.
 */
export default function Proxy({
  url: rawProxyUrl,
  basePath,
  host: hostToUse,
  customHeaders = [],
  excludeHeaders = [],
  includeScriptsToHead,
  avoidAppendPath,
  redirect = "manual",
  replaces,
  removeDirtyCookies = false,
}: Props): Handler {
  return async (req, _ctx) => {
    const url = new URL(req.url);
    const proxyUrl = noTrailingSlashes(rawProxyUrl);
    const qs = url.searchParams.toString();
    const path = basePath && basePath.length > 0
      ? url.pathname.replace(basePath, "")
      : url.pathname;
    const to = new URL(
      `${proxyUrl}${avoidAppendPath ? "" : sanitize(path)}?${qs}`,
    );
    const headers = new Headers(req.headers);
    HOP_BY_HOP.forEach((h) => headers.delete(h));
    if (isFreshCtx<DecoSiteState>(_ctx)) {
      _ctx?.state?.monitoring?.logger?.log?.("proxy received headers", headers);
    }
    removeCFHeaders(headers); // cf-headers are not ASCII-compliant
    if (removeDirtyCookies) {
      removeDirtyCookiesFn(headers);
    }
    if (isFreshCtx<DecoSiteState>(_ctx)) {
      _ctx?.state?.monitoring?.logger?.log?.("proxy sent headers", headers);
    }
    headers.set("origin", req.headers.get("origin") ?? url.origin);
    headers.set("host", hostToUse ?? to.host);
    headers.set("x-forwarded-host", url.host);
    for (const { key, value } of customHeaders) {
      if (key === "cookie") {
        const existingCookie = headers.get("cookie");
        if (existingCookie) {
          headers.set("cookie", `${existingCookie}; ${value}`);
        } else {
          headers.set("cookie", value);
        }
      } else {
        headers.set(key, value);
      }
    }
    for (const key of excludeHeaders) {
      headers.delete(key);
    }
    const response = await fetch(to, {
      headers,
      redirect,
      signal: req.signal,
      method: req.method,
      body: req.body,
    });
    const contentType = response.headers.get("Content-Type");
    let newBody: ReadableStream<Uint8Array> | string | null = response.body;
    if (
      contentType?.includes("text/html") &&
      includeScriptsToHead?.includes &&
      includeScriptsToHead.includes.length > 0
    ) {
      // Use a more efficient approach to insert scripts
      newBody = await response.text();
      // Find the position of <head> tag
      const headEndPos = newBody.indexOf("</head>");
      if (headEndPos !== -1) {
        // Split the response body at </head> position
        const beforeHeadEnd = newBody.substring(0, headEndPos);
        const afterHeadEnd = newBody.substring(headEndPos);
        // Prepare scripts to insert
        let scriptsInsert = "";
        for (const script of (includeScriptsToHead?.includes ?? [])) {
          scriptsInsert += typeof script.src === "string"
            ? script.src
            : script.src(req);
        }
        // Combine the new response body
        newBody = beforeHeadEnd + scriptsInsert + afterHeadEnd;
      }
    }
    // Change cookies domain
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("set-cookie");
    proxySetCookie(response.headers, responseHeaders, url);
    if (response.status >= 300 && response.status < 400) { // redirect change location header
      const location = responseHeaders.get("location");
      if (location) {
        responseHeaders.set("location", location.replace(proxyUrl, url.origin));
      }
    }
    let text: undefined | string = undefined;
    if (replaces && replaces.length > 0 && contentType?.includes("text/html")) {
      if (response.ok) {
        text = await new Response(newBody).text();
        replaces.forEach(({ from, to }) => {
          text = text?.replaceAll(from, to);
        });
      }
    }
    return new Response(text || newBody, {
      status: response.status,
      headers: responseHeaders,
    });
  };
}

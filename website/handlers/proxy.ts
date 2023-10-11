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
  {
    url: rawProxyUrl,
    basePath,
    host: hostToUse,
    customHeaders = [],
    includeScriptsToHead,
  }: Props,
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

  if (
    contentType?.includes("text/html") &&
    includeScriptsToHead?.includes &&
    includeScriptsToHead.includes.length > 0
  ) {
    let accHtml: string | undefined = "";
    const insertPlausible = new TransformStream({
      async transform(chunk, controller) {
        let newChunk = await chunk;
        if (accHtml !== undefined && includeScriptsToHead.includes) {
          for (let i = 0; i < chunk.length; i++) {
            accHtml = accHtml.slice(-5) + decoder.decode(chunk.slice(i, i + 1));

            if (accHtml === "<head>") {
              accHtml = "";

              accHtml += decoder.decode(chunk.slice(0, i + 1));
              for (const script of includeScriptsToHead.includes) {
                accHtml += script;
              }
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
  /**
   * @description Scripts to be included in the head of the html
   */
  includeScriptsToHead?: {
    includes?: string[];
    includePlausible: boolean;
  };
}

/**
 * @title Proxy
 * @description Proxies request to the target url.
 */
export default function Proxy(
  { url, basePath, host, customHeaders, includeScriptsToHead }: Props,
) {
  return proxyTo({ url, basePath, host, customHeaders, includeScriptsToHead });
}

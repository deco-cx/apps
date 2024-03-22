import { isFreshCtx } from "../handlers/fresh.ts";
import { DecoSiteState } from "deco/mod.ts";
import { Handler } from "std/http/mod.ts";
import { proxySetCookie } from "../../utils/cookie.ts";
import { Script } from "../types.ts";
import { Monitoring } from "deco/engine/core/resolver.ts";

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

async function logClonedResponseBody(
  response: Response,
  monitoring: Monitoring | undefined,
): Promise<void> {
  if (!response.body) {
    return;
  }

  const clonedResponse = response.clone();
  const text = await clonedResponse.text();

  monitoring?.rootSpan?.setAttribute?.(
    "proxy.error",
    `${response.statusText}, body = ${text}`,
  );
}

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
    includes?: Script[];
  };

  /**
   * @description follow redirects
   * @default 'manual'
   */
  redirect?: "manual" | "follow";

  avoidAppendPath?: boolean;
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
  includeScriptsToHead,
  redirect = "manual",
  avoidAppendPath,
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

    const monitoring = isFreshCtx<DecoSiteState>(_ctx)
      ? _ctx?.state?.monitoring
      : undefined;

    const fecthFunction = async () => {
      try {
        return await fetch(to, {
          headers,
          redirect,
          method: req.method,
          body: req.body,
        });
      } catch (err) {
        monitoring?.rootSpan?.setAttribute?.("proxy.exception", err.message);

        throw err;
      }
    };

    const response = await fecthFunction();

    if (response.status >= 299 || response.status < 200) {
      await logClonedResponseBody(response, monitoring);
    }

    const contentType = response.headers.get("Content-Type");

    let newBodyStream = null;

    if (
      contentType?.includes("text/html") &&
      includeScriptsToHead?.includes &&
      includeScriptsToHead.includes.length > 0
    ) {
      // Use a more efficient approach to insert scripts
      const insertScriptsStream = new TransformStream({
        async transform(chunk, controller) {
          const chunkStr = new TextDecoder().decode(await chunk);

          // Find the position of <head> tag
          const headEndPos = chunkStr.indexOf("</head>");
          if (headEndPos !== -1) {
            // Split the chunk at </head> position
            const beforeHeadEnd = chunkStr.substring(0, headEndPos);
            const afterHeadEnd = chunkStr.substring(headEndPos);

            // Prepare scripts to insert
            let scriptsInsert = "";
            for (const script of (includeScriptsToHead?.includes ?? [])) {
              scriptsInsert += typeof script.src === "string"
                ? script.src
                : script.src(req);
            }

            // Combine and encode the new chunk
            const newChunkStr = beforeHeadEnd + scriptsInsert + afterHeadEnd;
            controller.enqueue(new TextEncoder().encode(newChunkStr));
          } else {
            // If </head> not found, pass the chunk unchanged
            controller.enqueue(chunk);
          }
        },
      });

      // Modify the response body by piping through the transform stream
      if (response.body) {
        newBodyStream = response.body.pipeThrough(insertScriptsStream);
      }
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
    return new Response(
      newBodyStream === null ? response.body : newBodyStream,
      {
        status: response.status,
        headers: responseHeaders,
      },
    );
  };
}

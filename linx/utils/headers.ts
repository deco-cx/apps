import { removeCFHeaders } from "../../website/handlers/proxy.ts";

export const linxProxyFailingHeaders = [
  "x-b3-sampled",
  "x-b3-spanid",
  "x-b3-traceid",
  "x-envoy-attempt-count",
  "k-proxy-request",
];

const linxApiFailingHeaders = [
  "forwarded",
  "host",
  "origin",
  "referer",
  "cdn-loop",
];

/**
 * Some headers can cause the linx API to error, so we always filter
 * only the necessary ones when proxying request headers to the linx API
 */
export function toLinxHeaders(inputHeaders: Headers): Headers {
  const headers = new Headers(inputHeaders);

  removeCFHeaders(headers);

  for (const header of linxProxyFailingHeaders) {
    headers.delete(header);
  }

  for (const header of linxApiFailingHeaders) {
    headers.delete(header);
  }

  return headers;
}

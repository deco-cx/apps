import { removeCFHeaders } from "../../website/handlers/proxy.ts";

/**
 * Some headers can cause the linx API to error, so we always filter
 * only the necessary ones when proxying request headers to the linx API
 */
export function toLinxHeaders(inputHeaders: Headers): Headers {
  const headers = new Headers(inputHeaders);

  removeCFHeaders(headers);

  return headers;
}

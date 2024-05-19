/**
 * Some headers can cause the linx API to error, so we always filter
 * only the necessary ones when proxying request headers to the linx API
 */
export function toLinxHeaders(inputHeaders: Headers): Headers {
  const headers = new Headers();

  const inputCookies = inputHeaders.get("cookie");
  if (inputCookies) {
    headers.set("cookie", inputCookies);
  }

  return headers;
}

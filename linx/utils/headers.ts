import { getCookies } from "std/http/cookie.ts";

const COOKIES_TO_SEND = [
  "lscid",
  "tkt",
  "_bc_hash",
];

/** */
export function toLinxHeaders(inputHeaders: Headers): Headers {
  const headers = new Headers();
  const inputCookies = getCookies(inputHeaders);

  let outputCookies = "";
  for (const [key, value] of Object.entries(inputCookies)) {
    if (key in COOKIES_TO_SEND) {
      outputCookies += `${key}=${value};`;
    }
  }

  headers.set("cookie", outputCookies);

  return headers;
}

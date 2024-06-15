import { getSetCookies, setCookie } from "std/http/cookie.ts";
import { SESSION_COOKIE } from "./constants.ts";

export const proxySetCookie = (
  from: Headers,
  to: Headers,
  toDomain?: URL | string,
) => {
  const newDomain = toDomain && new URL(toDomain);

  for (const cookie of getSetCookies(from)) {
    if (cookie.name === SESSION_COOKIE) {
      continue;
    }
    const newCookie = newDomain
      ? {
        ...cookie,
        domain: newDomain.hostname,
      }
      : cookie;

    setCookie(to, newCookie);
  }
};

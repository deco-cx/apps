import { getCookies } from "std/http/cookie.ts";

export const SESSION_COOKIE = "SH_SESSION";
export const ANONYMOUS_COOKIE = "SH_USER";

export const getSessionCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[ANONYMOUS_COOKIE];
};

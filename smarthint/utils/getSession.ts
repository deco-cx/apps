import { getCookies } from "std/http/cookie.ts";

export const SESSION_COOKIE = "SmartHint_Session";
export const ANONYMOUS_COOKIE = "SmartHint_AnonymousConsumer";

export const getSessionCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[ANONYMOUS_COOKIE];
};

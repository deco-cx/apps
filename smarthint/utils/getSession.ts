import { getCookies } from "std/http/cookie.ts";

export const SESSION_COOKIE = "SmartHint-Session";
export const ANONYMOUS_COOKIE = "SmartHint-AnonymousConsumer";

export const getSessionCookie = (headers: Headers) => {
  const cookies = getCookies(headers);

  const anonymous = cookies[ANONYMOUS_COOKIE];
  const session = cookies[SESSION_COOKIE];

  return { anonymous, session };
};

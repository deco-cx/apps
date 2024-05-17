import { getCookies } from "std/http/cookie.ts";

export const SESSION_COOKIE = "PHPSESSID";

export const getUserCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[SESSION_COOKIE];
};

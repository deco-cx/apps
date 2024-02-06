import { getCookies } from "std/http/cookie.ts";

const LOGIN_COOKIE = "fbits-login";

export const getUserCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[LOGIN_COOKIE];
};

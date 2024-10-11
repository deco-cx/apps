import { getCookies } from "std/http/cookie.ts";

const AUTH_COOKIE = "client_id";

export const getUserCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[AUTH_COOKIE];
};

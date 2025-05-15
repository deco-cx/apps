import { getCookies } from "std/http/cookie.ts";
import { SESSION_COOKIE } from "../utils/constants.ts";

export const getUserCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[SESSION_COOKIE];
};

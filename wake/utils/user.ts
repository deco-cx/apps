import { getCookies, setCookie } from "std/http/cookie.ts";

export const LOGIN_COOKIE = "fbits-login";

export const getUserCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[LOGIN_COOKIE];
};

export const setUserCookie = (
  headers: Headers,
  token: string,
  legacyToken: string,
  expires: Date,
): void => {
  setCookie(headers, {
    name: "customerToken",
    path: "/",
    value: token,
    expires,
  });
  setCookie(headers, {
    name: "fbits-login",
    path: "/",
    value: legacyToken,
    // 1 year
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  });
};

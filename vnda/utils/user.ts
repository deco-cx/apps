import { getCookies, setCookie } from "std/http/cookie.ts";

const AUTH_COOKIE = "client_id";

const ONE_WEEK_MS = 7 * 24 * 3600 * 1_000;

export const getUserCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[AUTH_COOKIE];
};

export const setUserCookie = (headers: Headers, accessToken: string) => {
  setCookie(headers, {
    name: AUTH_COOKIE,
    value: accessToken,
    path: "/",
    expires: new Date(Date.now() + ONE_WEEK_MS),
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });
};

import { getCookies } from "std/http/mod.ts";
import { decode } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { stringify } from "./cookies.ts";

export const VTEX_ID_CLIENT_COOKIE = "VtexIdclientAutCookie";

interface CookiePayload {
  sub: string; // user email
  account: string; // account name
  audience: string; // "webstore";
  sess: string;
  exp: number; // 1684937945;
  userId: string;
}

export const parseCookie = (headers: Headers, account: string) => {
  const cookies = getCookies(headers);

  //const decoded = cookie ? decode(cookie) : null;
  const authCookieNames = Object.keys(cookies).filter((cookieName) =>
    cookieName.startsWith("VtexIdclientAutCookie")
  );

  const authCookies = authCookieNames
    ? authCookieNames.map((cookieName) => ({
      [cookieName]: cookies[cookieName],
    }))
    : [];

  const firstAuthCookie = authCookies.length > 0
    ? Object.values(authCookies[0])[0]
    : null;

  const payload = firstAuthCookie
    ? decode(firstAuthCookie)?.[1] as CookiePayload
    : undefined;

  return {
    cookie: stringify({
      ...Object.assign({}, ...authCookies),
    }),
    payload,
  };
};

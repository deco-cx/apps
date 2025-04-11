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

export const parseCookie = (headers: Headers) => {
  const cookies = getCookies(headers);

  const authCookieName = Object.keys(cookies).toSorted((a, z) =>
    a.length - z.length
  ).find((cookieName) => cookieName.startsWith("VtexIdclientAutCookie"));

  if (!authCookieName) {
    return {
      cookie: "",
    }
  }

  const cookie = authCookieName ? cookies[authCookieName] : undefined

  const decoded = cookie ? decode(cookie) : null;

  const payload = decoded?.[1] as CookiePayload | undefined;

  return {
    cookie: stringify({
      ...(cookies[authCookieName] &&
      {
        [authCookieName]:
          cookies[authCookieName],
      }),
    }),
    payload,
  };
};

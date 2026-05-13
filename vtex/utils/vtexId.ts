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

export const parseAuthCookie = (headers: Headers) => {
  const cookies = getCookies(headers);
  const token = cookies[VTEX_ID_CLIENT_COOKIE] ||
    Object.entries(cookies).find(([k]) =>
      k.startsWith(`${VTEX_ID_CLIENT_COOKIE}_`)
    )?.[1];

  if (!token) return null;

  const decoded = decode(token);
  return decoded?.[1] as CookiePayload | undefined ?? null;
};

export const parseCookie = (headers: Headers, account: string) => {
  const cookies = getCookies(headers);
  const cookie = cookies[VTEX_ID_CLIENT_COOKIE] ||
    cookies[`${VTEX_ID_CLIENT_COOKIE}_${account}`];
  const decoded = cookie ? decode(cookie) : null;

  const payload = decoded?.[1] as CookiePayload | undefined;

  return {
    cookie: stringify({
      ...(cookies[VTEX_ID_CLIENT_COOKIE] &&
        { [VTEX_ID_CLIENT_COOKIE]: cookies[VTEX_ID_CLIENT_COOKIE] }),
      ...(cookies[`${VTEX_ID_CLIENT_COOKIE}_${account}`] &&
        {
          [`${VTEX_ID_CLIENT_COOKIE}_${account}`]:
            cookies[`${VTEX_ID_CLIENT_COOKIE}_${account}`],
        }),
    }),
    payload,
  };
};

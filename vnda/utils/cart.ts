import { getCookies, setCookie } from "std/http/cookie.ts";
import { SEGMENT_COOKIE_NAME } from "./segment.ts";

const CART_COOKIE = "vnda_cart_id";

const ONE_WEEK_MS = 7 * 24 * 3600 * 1_000;

export const getCartCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[CART_COOKIE];
};

export const getAgentCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[SEGMENT_COOKIE_NAME];
};

export const setCartCookie = (headers: Headers, cartId: string) =>
  setCookie(headers, {
    name: CART_COOKIE,
    value: cartId,
    path: "/",
    expires: new Date(Date.now() + ONE_WEEK_MS),
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });

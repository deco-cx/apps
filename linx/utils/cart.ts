import { getCookies, setCookie } from "std/http/cookie.ts";

const CART_COOKIE = "BasketID";

const ONE_WEEK_MS = 7 * 24 * 3600 * 1_000;

export const getCartCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[CART_COOKIE];
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

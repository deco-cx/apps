import { getCookies, setCookie } from "std/http/cookie.ts";

const CART_COOKIE = "nuvemshop_cart_id";
const STORE_LOGIN_SESSION = "store_login_session";
const STORE_SESSION_PAYLOAD = "store_session_payload";

const ONE_WEEK_MS = 7 * 24 * 3600 * 1_000;

export const getCartCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[CART_COOKIE];
};

export const getStoreSessionCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[STORE_LOGIN_SESSION];
};

export const getStoreSessionPayloadCookie = (
  headers: Headers,
): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[STORE_SESSION_PAYLOAD];
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

export const setStoreSessionCookie = (headers: Headers, cartId: string) =>
  setCookie(headers, {
    name: STORE_LOGIN_SESSION,
    value: cartId,
    path: "/",
    expires: new Date(Date.now() + ONE_WEEK_MS),
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });

export const setStoreSessionPayloadCookie = (
  headers: Headers,
  cartId: string,
) =>
  setCookie(headers, {
    name: STORE_SESSION_PAYLOAD,
    value: cartId,
    path: "/",
    expires: new Date(Date.now() + ONE_WEEK_MS),
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });

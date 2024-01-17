import { getCookies, setCookie } from "std/http/cookie.ts";

const CART_COOKIE = "carrinho-id";

const TEN_DAYS_MS = 10 * 24 * 3600 * 1_000;

export const getCartCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[CART_COOKIE];
};

export const setCartCookie = (headers: Headers, cartId: string) =>
  setCookie(headers, {
    name: CART_COOKIE,
    value: cartId,
    path: "/",
    expires: new Date(Date.now() + TEN_DAYS_MS),
  });

export const setClientCookie = (value: string) => {
  let expires = "";

  const date = new Date(Date.now() + TEN_DAYS_MS);
  expires = "; expires=" + date.toUTCString();

  document.cookie = CART_COOKIE + "=" + (value || "") + expires + "; path=/";
};

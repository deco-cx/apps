import { getCookies, setCookie } from "std/http/cookie.ts";

const CART_COOKIE = "cart";
const SHOPIFY_PREFIX = "gid://shopify/Cart/";

const ONE_WEEK_MS = 7 * 24 * 3600 * 1_000;

export const getCartCookie = (headers: Headers): string | null => {
  const cookies = getCookies(headers);

  if (!cookies[CART_COOKIE]) {
    return null;
  }

  return `${SHOPIFY_PREFIX}${cookies[CART_COOKIE]}`;
};

export const setCartCookie = (headers: Headers, cartId: string) => {
  setCookie(headers, {
    name: CART_COOKIE,
    value: cartId.replace(SHOPIFY_PREFIX, ""),
    path: "/",
    expires: new Date(Date.now() + ONE_WEEK_MS),
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });
};

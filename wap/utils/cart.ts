import { getCookies } from "@std/http/cookie";

const CART_COOKIE = "PHPSESSID";

export const getCartCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[CART_COOKIE];
};

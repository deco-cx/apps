import { getCookies, setCookie } from "std/http/cookie.ts";

const CART_COOKIE = "nuvemshop_cart_id";
export const DESIRED_COOKIES = [
  "store_session_payload",
  "store_login_session",
];

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

export const setCartContextCookies = (
  headers: Headers,
  cookiesArray: string[],
) => {
  const cookiesToSet = [];

  for (const cookieStr of cookiesArray) {
    for (const desiredCookie of DESIRED_COOKIES) {
      if (cookieStr.trim().startsWith(desiredCookie)) {
        cookiesToSet.push(cookieStr.trim());
        break;
      }
    }
  }

  for (const cookie of cookiesToSet) {
    headers.append("Set-Cookie", cookie);
  }
};

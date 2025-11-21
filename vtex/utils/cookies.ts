import { getSetCookies, setCookie } from "std/http/cookie.ts";

export const stringify = (cookies: Record<string, string>) =>
  Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");

export const proxySetCookie = (
  from: Headers,
  to: Headers,
  toDomain?: URL | string,
  options?: {
    shouldClearCartCookie?: boolean;
  },
) => {
  const newDomain = toDomain && new URL(toDomain);

  for (const cookie of getSetCookies(from)) {
    const newCookie = newDomain
      ? {
        ...cookie,
        domain: newDomain.hostname,
      }
      : cookie;
      
    if(cookie.name === "checkout.vtex.com" && options?.shouldClearCartCookie) {
     
      setCookie(to, {
        name: "checkout.vtex.com",
        value: "",
        expires: new Date(0),
        maxAge: 0,
        path: "/",
        secure: true,
        httpOnly: true,
        domain: newDomain ? newDomain?.hostname : "",
      });
    } else {
      setCookie(to, newCookie);
    }
  }
};

export const CHECKOUT_DATA_ACCESS_COOKIE = "CheckoutDataAccess";
export const VTEX_CHKO_AUTH = "Vtex_CHKO_Auth";

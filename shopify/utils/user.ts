import { getCookies } from "std/http/cookie.ts";

const CUSTOMER_COOKIE = "secure_customer_sig";

export const getUserCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[CUSTOMER_COOKIE];
};

import { deleteCookie, getCookies, setCookie } from "std/http/cookie.ts";

const PARTNER_COOKIE = "partner-token";

const TEN_DAYS_MS = 10 * 24 * 3600 * 1_000;

export const getPartnerCookie = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);

  return cookies[PARTNER_COOKIE];
};

export const setPartnerCookie = (headers: Headers, PartnerToken: string) =>
  setCookie(headers, {
    name: PARTNER_COOKIE,
    value: PartnerToken,
    path: "/",
    expires: new Date(Date.now() + TEN_DAYS_MS),
  });

export const deletePartnerCookie = (headers: Headers) =>
  deleteCookie(headers, PARTNER_COOKIE);

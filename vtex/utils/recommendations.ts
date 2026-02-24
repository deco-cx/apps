import { getCookies } from "std/http/cookie.ts";

/**
 * @description Get the "x-vtex-rec-origin" header of the recommendation request.
 * @param req - The request object.
 * @param fallback - The fallback "x-vtex-rec-origin" header.
 * @returns The "x-vtex-rec-origin" header of the recommendation request.
 */
export function getOrigin(req: Request, account: string, fallback?: string) {
  const origin = req.headers.get("x-vtex-rec-origin");
  return origin || fallback || `${account}/storefront/deco.recommendations@1.x`;
}

const VTEX_RECOMMENDATIONS_COOKIE = "vtex-rec-user-id";

export function parseCookie(headers: Headers) {
  const cookies = getCookies(headers);
  const userId = cookies[VTEX_RECOMMENDATIONS_COOKIE];
  if (!userId) {
    return null;
  }
  return {
    userId: userId,
  };
}

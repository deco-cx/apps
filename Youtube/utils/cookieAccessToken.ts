import { getCookies, setCookie } from "@std/http";
import { COOKIE_EXPIRATION_TIME } from "./constant.ts";
import { AppContext } from "../mod.ts";

/**
 * Set the access token cookie
 * @param req - The request object
 * @param accessToken - The access token
 */
export function setAccessTokenCookie(
  res: AppContext["response"],
  accessToken: string,
): void {
  setCookie(res.headers, {
    name: "youtube_access_token2",
    value: accessToken,
    path: "/",
    expires: new Date(Date.now() + COOKIE_EXPIRATION_TIME),
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });
}

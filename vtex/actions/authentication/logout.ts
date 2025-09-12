// import { getCookies, getSetCookies } from "std/http/cookie.ts";
import type { AppContext } from "../../mod.ts";
import { proxySetCookie, REFRESH_TOKEN_COOKIE } from "../../utils/cookies.ts";
// import { setSegmentBag } from "../../utils/segment.ts";
import { redirect } from "@deco/deco";
import { LogoutResponse } from "../../utils/types.ts";
import { deleteCookie } from "std/http/cookie.ts";

export interface Props {
  /**
   * URL to redirect after logout
   * @default "/"
   */
  returnUrl?: string;
}

/**
 * @title VTEX Integration - Logout
 * @description Performs user logout and cleans session data
 */
export default async function action(
  { returnUrl = "/" }: Props,
  req: Request,
  ctx: AppContext,
): Promise<LogoutResponse> {
  const { account, vcsDeprecated } = ctx;

  const response = await vcsDeprecated["GET /api/vtexid/pub/logout"]({
    scope: account,
  }, {
    headers: {
      "cookie": req.headers.get("cookie") || "",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Logout request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  proxySetCookie(response.headers, ctx.response.headers, req.url);
  deleteCookie(ctx.response.headers, REFRESH_TOKEN_COOKIE); // TODO: REMOVE THIS AFTER TESTING AND VALIDATE IF NEEDED

  await ctx.invoke.vtex.actions.session
    .validateSession();

  redirect(returnUrl);
  return data;
}

import { getCookies, getSetCookies } from "std/http/cookie.ts";
import { AppContext } from "../../mod.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";
import { StartAuthentication } from "../../utils/types.ts";
import { proxySetCookie } from "../../utils/cookies.ts";

export interface Props {
  callbackUrl?: string;
  returnUrl?: string;
  appStart?: boolean;
}

/**
 * @title VTEX Integration - Start Authentication
 * @description Initiates the authentication process with VTEX.
 */
export default async function action(
  {
    callbackUrl = "/",
    returnUrl = "/",
    appStart = true,
  }: Props,
  req: Request,
  ctx: AppContext,
): Promise<StartAuthentication> {
  const { vcsDeprecated, account } = ctx;
  const cookies = getCookies(req.headers);
  const segment = getSegmentFromBag(ctx);
  // ("startAuthentication cookies", cookies);

  const response = await vcsDeprecated
    ["GET /api/vtexid/pub/authentication/start"]({
      locale: segment?.payload.cultureInfo ?? "pt-BR",
      scope: account,
      appStart,
      callbackUrl,
      returnUrl,
    }, {
      headers: { cookie: req.headers.get("cookie") || "" },
    });

  if (!response.ok) {
    throw new Error(
      `Failed to start authentication. ${response.status} ${response.statusText}`,
    );
  }

  const responseCookies = getCookies(response.headers);
  console.log("startAuthentication responseCookies", responseCookies);
  const cookiesSet = getSetCookies(response.headers);
  console.log("startAuthentication getSetCookies", cookiesSet);

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  const data = await response.json();
  return data;
}

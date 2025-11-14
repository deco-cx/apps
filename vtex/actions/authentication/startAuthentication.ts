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
 * @title Start Authentication
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
  const segment = getSegmentFromBag(ctx);

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

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  const data = await response.json();
  return data;
}

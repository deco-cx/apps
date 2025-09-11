import { getCookies, getSetCookies } from "std/http/cookie.ts";
import { AppContext } from "../../mod.ts";
import { AuthResponse } from "../../utils/types.ts";
import { buildCookieJar, proxySetCookie } from "../../utils/cookies.ts";

export interface Props {
  email: string;
  accessKey: string;
}

/**
 * @title VTEX Integration - Authenticate with Email and AcessKey
 * @description Return authStatus that show if user is logged or something wrong happens.
 */
export default async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<AuthResponse> {
  const { vcsDeprecated } = ctx;

  if (!props.email || !props.accessKey) {
    throw new Error("Email and/or accessKey is missing");
  }

  const cookies = getCookies(req.headers);
  const startSetCookies = getSetCookies(ctx.response.headers);
  const { header: cookie } = buildCookieJar(req.headers, startSetCookies);

  const VtexSessionToken = cookies?.["VtexSessionToken"] ?? null;

  if (!VtexSessionToken) {
    throw new Error('"VtexSessionToken" cookie is missing');
  }

  const body = new URLSearchParams();
  body.append("login", props.email);
  body.append("accessKey", props.accessKey);
  body.append("authenticationToken", VtexSessionToken);

  const response = await vcsDeprecated
    ["POST /api/vtexid/pub/authentication/accesskey/validate"](
      {},
      {
        body,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          cookie,
        },
      },
    );

  if (!response.ok) {
    throw new Error(
      `Authentication request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data: AuthResponse = await response.json();
  proxySetCookie(response.headers, ctx.response.headers, req.url);
  await ctx.invoke.vtex.actions.session.validateSession();

  // TODO: REMOVE THIS AFTER TESTING
  const setCookies = getSetCookies(ctx.response.headers);
  console.log("accessKeySignIn ctx response headers", setCookies);

  return data;
}

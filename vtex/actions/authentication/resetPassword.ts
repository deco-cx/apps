import { AppContext } from "../../mod.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";
import { AuthResponse } from "../../utils/types.ts";
import { getSetCookies, setCookie } from "std/http/cookie.ts";
import {
  buildCookieJar,
  proxySetCookie,
  REFRESH_TOKEN_COOKIE,
} from "../../utils/cookies.ts";

export interface Props {
  email: string;
  currentPassword: string;
  newPassword: string;
}

/**
 * @title VTEX Integration - Redefine password
 * @description
 */
export default async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<AuthResponse> {
  const { vcsDeprecated, account } = ctx;
  const segment = getSegmentFromBag(ctx);

  if (!props.email || !props.currentPassword || !props.newPassword) {
    throw new Error("Email and/or password is missing");
  }

  const startAuthentication = await ctx.invoke.vtex.actions.authentication
    .startAuthentication({});

  const startSetCookies = getSetCookies(ctx.response.headers);
  const { header: cookie } = buildCookieJar(req.headers, startSetCookies);

  if (!startAuthentication?.authenticationToken) {
    throw new Error(
      "No authentication token returned from startAuthentication",
    );
  }

  const authenticationToken = startAuthentication.authenticationToken;

  const urlencoded = new URLSearchParams();
  urlencoded.append("login", props.email);
  urlencoded.append("currentPassword", props.currentPassword);
  urlencoded.append("newPassword", props.newPassword);
  urlencoded.append("authenticationToken", authenticationToken);

  const response = await vcsDeprecated
    ["POST /api/vtexid/pub/authentication/classic/setpassword"](
      {
        locale: segment?.payload.cultureInfo || "pt-BR",
        scope: account,
      },
      {
        body: urlencoded,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
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

  // TODO: REMOVE THIS AFTER TESTING AND VALIDATE IF NEEDED REWRITE REFRESH_TOKEN_COOKIE
  const setCookies = getSetCookies(ctx.response.headers);
  for (const cookie of setCookies) {
    if (cookie.name === REFRESH_TOKEN_COOKIE) {
      setCookie(ctx.response.headers, {
        ...cookie,
        path: "/", // default path is /api/vtexid/refreshtoken/webstore, but browser dont send to backend headers
      });
    }
  }

  return data;
}

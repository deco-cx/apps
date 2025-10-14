import { AppContext } from "../../mod.ts";
import { AuthResponse } from "../../utils/types.ts";
// import setLoginCookies from "../../utils/login/setLoginCookies.ts";
import { getSetCookies, setCookie } from "std/http/cookie.ts";
import {
  buildCookieJar,
  proxySetCookie,
  REFRESH_TOKEN_COOKIE,
} from "../../utils/cookies.ts";

export interface Props {
  email: string;
  password: string;
}

/**
 * @title Authenticate with Email and Password
 * @description This function authenticates a user using their email and password.
 */
export default async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<AuthResponse> {
  const { vcsDeprecated } = ctx;

  if (!props.email || !props.password) {
    throw new Error("Email and/or password is missing");
  }

  const startAuthentication = await ctx.invoke.vtex.actions.authentication
    .startAuthentication({});

  const startSetCookies = getSetCookies(ctx.response.headers);
  const { header: cookieHeader } = buildCookieJar(req.headers, startSetCookies);
  const authenticationToken = startAuthentication?.authenticationToken;

  if (!authenticationToken) {
    throw new Error(
      "No authentication token returned from startAuthentication",
    );
  }

  const urlencoded = new URLSearchParams();
  urlencoded.append("email", props.email);
  urlencoded.append("password", props.password);
  urlencoded.append("authenticationToken", authenticationToken);

  const response = await vcsDeprecated[
    "POST /api/vtexid/pub/authentication/classic/validate"
  ](
    {},
    {
      body: urlencoded,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        cookie: cookieHeader,
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
  // First login was made, but we need to call the refresh token at least once to get the refreshAfter for the first time
  const dataRefreshToken = await ctx.invoke.vtex.actions.authentication
    .refreshToken();
  await ctx.invoke.vtex.actions.session.validateSession({
    publicProperties: {
      refreshAfter: { value: dataRefreshToken.refreshAfter },
    },
  });

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

import { AppContext } from "../../mod.ts";
import { AuthResponse } from "../../utils/types.ts";
// import setLoginCookies from "../../utils/login/setLoginCookies.ts";
import { getCookies, getSetCookies } from "std/http/cookie.ts";
import { buildCookieJar, proxySetCookie } from "../../utils/cookies.ts";

export interface Props {
  email: string;
  password: string;
}

/**
 * @title VTEX Integration - Authenticate with Email and Password
 * @description This function authenticates a user using their email and password.
 */
export default async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<AuthResponse> {
  const { vcsDeprecated } = ctx;
  const cookies = getCookies(req.headers);
  console.log("classicSignIn cookies antes", cookies);

  if (!props.email || !props.password) {
    throw new Error("Email and/or password is missing");
  }

  const startAuthentication = await ctx.invoke.vtex.actions.authentication
    .startAuthentication({});
  console.log("classicSignIn cookies depois", getCookies(ctx.response.headers));

  const startSetCookies = getSetCookies(ctx.response.headers);
  const { header: cookieHeader } = buildCookieJar(req.headers, startSetCookies);
  console.log("classicSignIn cookieHeader", cookieHeader);
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

  const response = await vcsDeprecated
    ["POST /api/vtexid/pub/authentication/classic/validate"](
      {},
      {
        body: urlencoded,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "cookie": cookieHeader,
        },
      },
    );
  const responseCookies = getCookies(response.headers);
  console.log("classicSignIn responseCookies", responseCookies);
  const cookiesSet = getSetCookies(response.headers);
  console.log("classicSignIn getSetCookies", cookiesSet);

  if (!response.ok) {
    throw new Error(
      `Authentication request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data: AuthResponse = await response.json();
  proxySetCookie(response.headers, ctx.response.headers, req.url);
  await ctx.invoke.vtex.actions.session.validateSession();
  // const setCookies = getSetCookies(response.headers);
  // console.log("classicSignIn setCookies", setCookies);

  // console.log("classicSignIn validateSession", validateSession);

  // await setLoginCookies(data, ctx, setCookies);

  const classicToClient = getSetCookies(ctx.response.headers);
  console.log("classicSignIn classicToClient setCookies", classicToClient);

  return data;
}

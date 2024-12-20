import { getCookies } from "@std/http/cookie";
import { decode } from "@zaubrik/djwt";
import { setCookie } from "std/http/cookie.ts";
import type { AppMiddlewareContext } from "./mod.ts";

const DAY = 60 * 60 * 24;

const setToken = (headers: Headers, token: string) => {
  setCookie(headers, {
    name: "authToken",
    value: token,
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: DAY * 30,
  });
};
export const middleware = async (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  // Set IP
  // const ips = headers.get('CF-Connecting-IP') || headers.get('x-forwarded-for') || headers.get('x-real-ip')
  // const ip = ips?.split(',')[0]

  // if (!ip) throw new Error('IP not found')
  // req.headers.set('ip', ip)

  let authToken = getCookies(req.headers).authToken;

  // You just need these headers for /auth actually
  const headers = new Headers({
    "X-App-id": ctx.appId,
    "X-App-key": ctx.appKey,
  });

  const auth = () =>
    ctx.api["GET /auth"]({}, { headers }).then((res) => res.json());
  const authRefresh = () =>
    ctx.api["GET /auth/refreshToken"]({}, { headers }).then((res) =>
      res.json()
    );

  // Set Token
  if (authToken) {
    const [_, { refreshTokenExpirationDate, exp: expSeconds }] = decode<{
      refreshTokenExpirationDate: number;
      exp: number;
    }>(authToken);

    // https://stackoverflow.com/a/49624860
    const exp = new Date(0);
    exp.setUTCSeconds(expSeconds);

    // If token can't be refreshed, get a new auth token
    if (refreshTokenExpirationDate < Date.now()) {
      authToken = (await auth()).token as string;
      setToken(ctx.response.headers, authToken);
    } // If the token just expired, refresh it
    else if (exp.getTime() < Date.now()) {
      headers.set("Authorization", `Bearer ${authToken}`);

      authToken = (await authRefresh()).token as string;
      setToken(ctx.response.headers, authToken);
    }
  } // If no token, get a new auth token
  else {
    authToken = (await auth()).token as string;
    setToken(ctx.response.headers, authToken);
  }

  req.headers.set("Authorization", `Bearer ${authToken}`);

  return await ctx.next?.();
};

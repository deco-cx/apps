import { deleteCookie, getSetCookies, setCookie } from "std/http/cookie.ts";
import { AppContext } from "../../mod.ts";
import { buildCookieJar, REFRESH_TOKEN_COOKIE } from "../../utils/cookies.ts";

interface Props {
  fingerprint?: string;
}

const STATUS = {
  SUCCESS: "Success",
  INVALID_SESSION: "InvalidSession",
  INVALID_TOKEN: "InvalidToken",
  INVALID_EMAIL: "InvalidEmail",
  INVALID_SCOPE: "InvalidScope",
  ERROR: "Error",
};

/**
 * @title Refresh Authentication Token
 * @description This function refreshes the VTEX authentication token using current session cookies.
 */
export default async function refreshToken(
  props: Props,
  req: Request,
  ctx: AppContext,
) {
  const { fingerprint } = props;
  const { vcsDeprecated } = ctx;
  const setCookiesSoFar = getSetCookies(ctx.response.headers);
  const { cookies, header: cookie } = buildCookieJar(
    req.headers,
    setCookiesSoFar,
  );

  if (!cookies[REFRESH_TOKEN_COOKIE]) {
    throw new Error("Refresh token cookie is missing");
  }

  const response = await vcsDeprecated
    ["POST /api/vtexid/refreshtoken/webstore"]({}, {
      body: {
        fingerprint,
      },
      headers: {
        cookie,
      },
    });

  if (!response.ok) {
    throw new Error(
      `Authentication request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  if (data?.status !== STATUS.SUCCESS) {
    deleteCookie(ctx.response.headers, REFRESH_TOKEN_COOKIE, {
      path: "/",
      domain: new URL(req.url).hostname,
    });
  }

  const setCookies = getSetCookies(response.headers);
  for (const cookie of setCookies) {
    setCookie(ctx.response.headers, {
      ...cookie,
      path: cookie.name === REFRESH_TOKEN_COOKIE ? "/" : cookie.path,
      domain: new URL(req.url).hostname,
    });
  }

  return data;
}

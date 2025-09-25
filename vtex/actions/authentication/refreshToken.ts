import { deleteCookie, getCookies } from "std/http/cookie.ts";
import { AppContext } from "../../mod.ts";
import { REFRESH_TOKEN_COOKIE } from "../../utils/cookies.ts";
import { proxySetCookie } from "../../utils/cookies.ts";

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
  const cookies = getCookies(req.headers);

  if (!cookies[REFRESH_TOKEN_COOKIE]) {
    throw new Error("Refresh token cookie is missing");
  }

  const response = await vcsDeprecated
    ["POST /api/vtexid/refreshtoken/webstore"]({}, {
      body: {
        fingerprint,
      },
      headers: {
        cookie: req.headers.get("cookie") || "",
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

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return data;
}

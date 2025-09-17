import { getCookies, setCookie } from "std/http/cookie.ts";
import { AppContext } from "../../mod.ts";
import getLoginCookies from "../../utils/login/getLoginCookies.ts";
import { getSetCookies } from "std/http/mod.ts";
import { VID_RT_COOKIE_NAME } from "../../utils/login/setLoginCookies.ts";

interface Props {
  fingerprint?: string;
}

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
  const cookies = getLoginCookies({ cookies: getCookies(req.headers) });

  if (!cookies.vid_rt) {
    throw new Error("Refresh token cookie is missing");
  }

  const response = await vcsDeprecated
    ["POST /api/vtexid/refreshtoken/webstore"]({}, {
      body: {
        fingerprint,
      },
      headers: {
        cookie: Object.entries(cookies)
          .map(([name, value]) => `${name}=${value}`)
          .join("; "),
      },
    });

  if (!response.ok) {
    throw new Error(
      `Authentication request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  const setCookies = getSetCookies(response.headers);
  const vidRtCookie = setCookies?.find((cookie) =>
    cookie.name === VID_RT_COOKIE_NAME
  );
  const authCookies = setCookies?.filter((cookie) =>
    cookie.name.startsWith("VtexIdclientAutCookie")
  ).filter((cookie) => cookie !== undefined);

  if (!vidRtCookie) {
    return;
  }

  const expiresDate = new Date(vidRtCookie.expires ?? 0);
  const maxAge = Math.max(
    0,
    Math.floor((expiresDate.getTime() - Date.now()) / 1000),
  );

  setCookie(ctx.response.headers, {
    name: VID_RT_COOKIE_NAME,
    value: vidRtCookie.value,
    httpOnly: true,
    maxAge: maxAge,
    path: "/",
    secure: true,
  });

  for (const cookie of authCookies) {
    setCookie(ctx.response.headers, {
      name: cookie.name,
      value: cookie.value,
      httpOnly: true,
      maxAge: maxAge,
      path: "/",
      secure: true,
    });
  }

  return data;
}

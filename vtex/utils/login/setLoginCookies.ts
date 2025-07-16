import { Cookie, setCookie } from "std/http/cookie.ts";
import { AuthResponse } from "../types.ts";
import { AppContext } from "../../mod.ts";

export const VID_RT_COOKIE_NAME = "vid_rt";

export default async function completeLogin(
  data: AuthResponse,
  ctx: AppContext,
  setCookies?: Cookie[],
) {
  if (data.authStatus === "Success") {
    let maxAge = data.expiresIn;

    // Set vid_rt cookie from setCookies array if available and setRefreshToken is true
    if (setCookies && ctx.setRefreshToken) {
      const vidRtCookie = setCookies.find((cookie) =>
        cookie.name === VID_RT_COOKIE_NAME
      );

      if (vidRtCookie) {
        // Calculate maxAge from expires date to maintain consistency with other cookies
        const expiresDate = new Date(vidRtCookie.expires ?? 0);
        maxAge = Math.max(
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
      }
    }

    if (data.authCookie) {
      setCookie(ctx.response.headers, {
        name: data.authCookie.Name,
        value: data.authCookie.Value,
        httpOnly: true,
        maxAge: maxAge,
        path: "/",
        secure: true,
      });
    }

    if (data.accountAuthCookie) {
      setCookie(ctx.response.headers, {
        name: data.accountAuthCookie.Name,
        value: data.accountAuthCookie.Value,
        httpOnly: true,
        maxAge: maxAge,
        path: "/",
        secure: true,
      });
    }
  }

  await ctx.invoke.vtex.actions.session.editSession({});
}

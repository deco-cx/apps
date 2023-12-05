import { AppMiddlewareContext } from "./mod.ts";
import { getCookies } from "std/http/mod.ts";
import authApi from "./utils/auth.ts";
import createCart from "./utils/createCart.ts";
import {
  getSessionCookie,
  setSession,
  setSessionCookie,
} from "./utils/session.ts";
import { Session } from "./utils/types.ts";
const ONCE = Symbol("once");

const handleAuthAndBasket = async (
  ctx: AppMiddlewareContext,
  grantType: string,
  refreshToken?: string,
): Promise<Session> => {
  const token = await authApi({ grantType, refreshToken }, ctx);
  if (token) {
    const basket = await createCart(token.access_token, ctx);
    if (basket) {
      const session = {
        token: token.access_token,
        basketId: basket.basketId,
      };

      setSessionCookie(
        session,
        token,
        ctx.response.headers,
      );
      return session;
    }
  }
  return { token: "", basketId: "" };
};

export const middleware = async (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  if (!ctx.bag.has(ONCE)) {
    ctx.bag.set(ONCE, true);

    const cookies = getCookies(req.headers);

    const cc_nxCookie = cookies[`cc-nx_${ctx.siteId}`];
    const cc_nx_gCookie = cookies[`cc-nx-g_${ctx.siteId}`];
    const refreshToken = cc_nxCookie || cc_nx_gCookie;

    let session = getSessionCookie(req);

    if (!session.token && refreshToken) {
      session = await handleAuthAndBasket(
        ctx,
        "refresh_token",
        refreshToken,
      );
    }

    if (!session.token) {
      session = await handleAuthAndBasket(ctx, "client_credentials");
    }

    setSession(ctx, session);
  }
  return await ctx.next!();
};

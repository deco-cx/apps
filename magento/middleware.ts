import { getCookies } from "std/http/cookie.ts";
import { AppMiddlewareContext, AppContext } from "./mod.ts";
import { SESSION_COOKIE } from "./utils/constants.ts";

export const middleware = async (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext | AppContext
) => {
  const ctxApp = ctx as AppContext;
  const ctxMiddleware = ctx as AppMiddlewareContext;

  const sessionCookie = getCookies(req.headers)[SESSION_COOKIE];
  if (sessionCookie) {
    return ctxMiddleware.next!();
  }
  const request = await fetch(`${ctxApp.baseUrl}/V1`);
  const cookies = request.headers.getSetCookie().join("; ");
  ctx.response.headers.append("cookie", cookies);
  return ctxMiddleware.next!();
};

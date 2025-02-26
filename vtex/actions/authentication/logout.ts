import { getCookies, setCookie } from "std/http/mod.ts";
import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export default async function logout(
  _: unknown,
  req: Request,
  ctx: AppContext,
) {
  const cookies = getCookies(req.headers);
  const { payload } = parseCookie(req.headers, ctx.account);

  for (const cookieName in cookies) {
    if (cookieName.startsWith("VtexIdclientAutCookie")) {
      setCookie(ctx.response.headers, {
        name: cookieName,
        value: "",
        expires: new Date(0),
        path: "/",
      });
    }
  }

  try {
    if (payload?.sess) {
      await ctx.invoke.vtex.actions.session.deleteSession({
        sessionId: payload?.sess,
      });
    }
  } catch (error) {
    console.error("Error deleting session", error);
  }
}

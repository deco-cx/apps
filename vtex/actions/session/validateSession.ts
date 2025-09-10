import { getCookies } from "std/http/cookie.ts";
import type { AppContext } from "../../mod.ts";

export default async function action(
  _props: unknown,
  req: Request,
  ctx: AppContext,
) {
  const sessionCookie = getCookies(req.headers)?.vtex_session;
  const sessionAction = sessionCookie
    ? ctx.invoke.vtex.actions.session.editSession
    : ctx.invoke.vtex.actions.session.createSession;

  const response = await sessionAction();
  return response;
}

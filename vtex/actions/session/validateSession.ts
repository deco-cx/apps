import { getCookies } from "std/http/cookie.ts";
import type { AppContext } from "../../mod.ts";
import { GetSessionResponse } from "../../utils/openapi/vcs.openapi.gen.ts";
import { SessionProps } from "../../utils/types.ts";

export default async function action(
  props: SessionProps,
  req: Request,
  ctx: AppContext,
): Promise<GetSessionResponse> {
  const sessionCookie = getCookies(req.headers)?.vtex_session;
  const sessionAction = sessionCookie
    ? ctx.invoke.vtex.actions.session.editSession
    : ctx.invoke.vtex.actions.session.createSession;

  const response = await sessionAction(props);
  return response;
}

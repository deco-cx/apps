import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface DeleteSession {
  logOutFromSession: string;
}

const mutation = `mutation LogOutFromSession($sessionId: ID) {
  logOutFromSession(sessionId: $sessionId) @context(provider: "vtex.store-graphql@2.x")
}`;

interface Props {
  sessionId: string;
}

/**
 * @title Delete Session
 * @description Delete a session
 */
async function action(
  { sessionId }: Props,
  req: Request,
  ctx: AppContext,
): Promise<DeleteSession> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    throw new Error("User cookie is invalid");
  }

  return await io.query<DeleteSession, { sessionId: string }>({
    query: mutation,
    variables: { sessionId },
  }, { headers: { cookie } });
}

export default action;

import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface DeleteSession {
  logOutFromSession: string;
}

interface Props {
  sessionId: string;
}

async function loader(
  { sessionId }: Props,
  req: Request,
  ctx: AppContext,
): Promise<DeleteSession | null> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const mutation = `mutation LogOutFromSession($sessionId: ID) {
    logOutFromSession(sessionId: $sessionId) @context(provider: "vtex.store-graphql@2.x")
  }`;

  try {
    return await io.query<DeleteSession, { sessionId: string }>({
      query: mutation,
      variables: { sessionId },
    }, { headers: { cookie } });
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default loader;

import { AppContext } from "apps/vtex/mod.ts";
import { parseCookie } from "../utils/vtexId.ts";

export interface User {
  id: string;
  email: string;
}

function loader(_props: unknown, req: Request, ctx: AppContext): User | null {
  const { payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.sub,
  };
}

export default loader;

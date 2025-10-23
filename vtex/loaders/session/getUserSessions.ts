import type { AppContext } from "../../mod.ts";
import type { LoginSessionsInfo } from "../../utils/types.ts";
import { parseCookie } from "../../utils/vtexId.ts";

const query = `query getUserSessions {
  loginSessionsInfo {
    currentLoginSessionId
    loginSessions {
      id
      cacheId
      deviceType
      city
      lastAccess
      browser
      os
      ip
      fullAddress
      firstAccess
    }
  }
}`;

/**
 * @title Get User Sessions
 * @description Get the sessions of the user logged in
 */
async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<LoginSessionsInfo> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    throw new Error("User cookie is invalid");
  }

  const data = await io.query<
    { loginSessionsInfo: LoginSessionsInfo },
    null
  >(
    { query },
    { headers: { cookie } },
  );

  return data.loginSessionsInfo;
}

export default loader;

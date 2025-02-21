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

async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<LoginSessionsInfo | null> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  try {
    const data = await io.query<
      { loginSessionsInfo: LoginSessionsInfo },
      null
    >(
      { query },
      { headers: { cookie } },
    );

    return data.loginSessionsInfo;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default loader;

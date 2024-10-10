import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface LoginSessionInfo {
  currentLoginSessionId: string;
  loginSessions: LoginSession[];
}

export interface LoginSession {
  id: string;
  cacheId: string;
  deviceType: string;
  lastAccess: string;
  city: string;
  fullAddress: string;
  ip: string;
  browser: string;
  os: string;
  firstAccess: string;
}

async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<LoginSessionInfo | null> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const query = `query getUserSessions {
      loginSessionsInfo {
        currentLoginSessionId
        loginSessions {
          id
          cacheId
          deviceType
          lastAccess
          city
          fullAddress
          ip
          browser
          os
          firstAccess
        }
      }
    }`;

  try {
    const data = await io.query<
      { loginSessionsInfo: LoginSessionInfo },
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

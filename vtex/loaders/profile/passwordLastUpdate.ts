import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface ProfilePassword {
  passwordLastUpdate?: PasswordLastUpdate;
}

export type PasswordLastUpdate = string | null;

async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<PasswordLastUpdate | null> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const query = `query getUserProfile { profile { passwordLastUpdate }}`;

  try {
    const { profile } = await io.query<{ profile: ProfilePassword }, null>(
      { query },
      { headers: { cookie } },
    );

    return profile.passwordLastUpdate ?? null;
  } catch (_) {
    return null;
  }
}

export default loader;

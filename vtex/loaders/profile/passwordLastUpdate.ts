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
  console.log({ teste: payload?.userId });

  const query = `query getUserProfile { profile { passwordLastUpdate }}`;

  try {
    const { profile } = await io.query<{ profile: ProfilePassword }, null>(
      { query },
      { headers: { cookie } },
    );

    console.log({ profile });

    return profile.passwordLastUpdate ?? null;
  } catch (_) {
    return null;
  }
}

export default loader;

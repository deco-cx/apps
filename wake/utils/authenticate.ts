import type { AppContext } from "../mod.ts";
import { getUserCookie } from "../utils/user.ts";

const authenticate = async (
  req: Request,
  ctx: AppContext,
): Promise<string | null> => {
  const { checkoutApi } = ctx;

  const loginCookie = getUserCookie(req.headers);

  if (!loginCookie) return null;

  const data = await checkoutApi
    ["GET /api/Login/Get"](
      {},
      { headers: req.headers },
    ).then((r) => r.json());

  if (!data?.CustomerAccessToken) return null;

  return data?.CustomerAccessToken;
};

export default authenticate;

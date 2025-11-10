import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Props {
  email: string;
  ensureComplete?: boolean;
}

/**
 * @title Get Profile By Email
 * @description Get a profile by email
 */
export async function loader(
  { email, ensureComplete }: Props,
  req: Request,
  ctx: AppContext,
) {
  const { vcs } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const response = await vcs["GET /api/checkout/pub/profiles"]({
    email,
    ensureComplete,
  }, {
    headers: {
      "Accept": "application/json",
      cookie,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch user profile: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  return data;
}

export const defaultVisibility = "private";
export default loader;

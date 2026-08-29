import { Person } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import { getUserCookie } from "../utils/user.ts";

/**
 * @title VNDA Integration
 * @description User loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Person | null> => {
  const { api } = ctx;

  const userAccessToken = getUserCookie(req.headers);

  if (!userAccessToken) return null;

  try {
    const user = await api["GET /api/v2/clients/:id"]({ id: userAccessToken })
      .then((res) => res.json());

    if (!user) return null;

    return {
      "@id": String(user.id),
      email: user.email ?? "",
      givenName: user.first_name ?? "",
      familyName: user.last_name ?? "",
    };
  } catch {
    return null;
  }
};

export default loader;

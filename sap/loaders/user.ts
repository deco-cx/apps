import { AppContext } from "../mod.ts";
import { User } from "../utils/types.ts";

/**
 * @docs
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<User> => {
  const { api } = ctx;

  // Cookie to validate if it's logged in

  const response = await api["GET /users/:userId"](
    { userId: "current", headers: {} },
  );

  const result = response.json();

  return result;
};

export default loader;

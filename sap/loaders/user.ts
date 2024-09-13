import { AppContext } from "../mod.ts";
import { User } from "../utils/types.ts";

/**
 * @title SAP Integration
 * @description WORK IN PROGRESS - User loader
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<User> => {
  const { api } = ctx;

  // WIP - Need to check cookie to validate if it's logged in

  const response = await api["GET /users/:userId"](
    { userId: "current" },
  );

  const result = response.json();

  return result;
};

export default loader;

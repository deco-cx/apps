import { AppContext } from "../mod.ts";
import { Cart } from "../utils/types.ts";

/**
 * @title SAP Integration
 * @description WORK IN PROGRESS - Cart loader
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { api } = ctx;

  // Cookie to validate if it's logged in
  // Cookie to validate if the user has a cart

  const isLogged = false;
  const hasAnonymousCart = false;

  if (isLogged) {
    const response = await api["GET /users/:userId/carts/:cartId"](
      { cartId: "", userId: "current" },
    );

    return response.json();
  }

  const response = await api["POST /users/:userId/carts"](
    {
      oldCartId: hasAnonymousCart ? "" : null,
      userId: "anonymous",
    },
  );

  return response.json();
};

export default loader;

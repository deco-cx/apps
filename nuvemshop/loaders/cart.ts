import { AppContext } from "../mod.ts";
import { getCartCookie } from "../utils/cart.ts";
import { Cart } from "../utils/types.ts";

const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Cart | undefined> => {
  const { api } = ctx;
  const maybeCartId = getCartCookie(req.headers);

  if (!maybeCartId) {
    return;
  }

  const cart = await api["GET /carts/:id"]({
    id: maybeCartId,
  }).then((response) => response.json());

  return cart;
};

export default loader;

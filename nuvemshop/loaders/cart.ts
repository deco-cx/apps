import { AppContext } from "../mod.ts";
import { getCartCookie, setCartCookie } from "../utils/cart.ts";

const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<GetCartQuery["cart"]> => {
  const { api } = ctx;
  const maybeCartId = getCartCookie(req.headers);

  if (!maybeCartId) {
    return;
  }

  const cart = await api["GET /carts/:id"]({
    id: maybeCartId,
  }).then((response) => response.json());

  console.log("cart", cart);

  return { cart };
};

export default loader;

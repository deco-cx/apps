import { getCartCookie, setCartCookie } from "../utils/cart.ts";
import { AppContext } from "../../linx/mod.ts";
import type { Cart } from "../utils/client.ts";

/**
 * @title Linx Integration
 * @description Cart loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { api } = ctx;
  const cartId = getCartCookie(req.headers);

  const orderForm = cartId
    ? await api["GET /web-api/v1/Shopping/Basket/Get"]({ cartId })
      .then((res) => res.json())
    : await api["POST /web-api/v1/Shopping/Basket/AddProduct"]({}).then((res) =>
      res.json()
    );

  setCartCookie(
    ctx.response.headers,
    orderForm?.Shopper?.Basket?.BasketID.toString(),
  );

  return {
    orderForm,
  };
};

export default loader;

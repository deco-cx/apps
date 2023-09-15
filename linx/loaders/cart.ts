import { AppContext } from "../../linx/mod.ts";
import type { Cart } from "../utils/client.ts";

/**
 * @title Linx Integration
 * @description Cart loader
 */
const loader = (
  _props: unknown,
  _req: Request,
  _ctx: AppContext,
): Promise<Cart | null> => {
  throw new Error("Not implemented");
  // const { api } = ctx;
  // const cartId = getCartCookie(req.headers);

  // const cart = cartId
  //   ? await api["GET /web-api/v1/Shopping/Basket/Get"]({ cartId })
  //     .then((res) => res.json())
  //   : await api["POST /web-api/v1/Shopping/Basket/AddProduct"]({}, { body: {} })
  //     .then((res) => res.json());

  // const cookie = cart?.Shopper?.Basket?.BasketID.toString();

  // if (cookie) {
  //   setCartCookie(ctx.response.headers, cookie);
  // }

  // return cart;
};

export default loader;

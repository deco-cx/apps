import type { AppContext } from "../../linx/mod.ts";
import { proxySetCookie } from "../../utils/cookie.ts";
import { nullOnNotFound } from "../../utils/http.ts";
import { isBasketModel } from "../utils/paths.ts";
import { toCart } from "../utils/transform.ts";
import type { Cart } from "../utils/types/basketJSON.ts";

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

  const response = await api["GET /*splat"]({ splat: "carrinho.json" }, {
    headers: req.headers,
  }).catch(nullOnNotFound);

  if (response === null) {
    return null;
  }

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  const cart = await response.json();

  if (!cart || !isBasketModel(cart)) {
    throw new Error("/carrinho.json returned another model than Basket");
  }

  return toCart(cart, ctx);
};

export default loader;

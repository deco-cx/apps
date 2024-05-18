import type { AppContext } from "../../linx/mod.ts";
import { proxySetCookie } from "../../utils/cookie.ts";
import { toLinxHeaders } from "../utils/headers.ts";
import { toCart } from "../utils/transform.ts";
import type { CartResponse } from "../utils/types/basketJSON.ts";

/**
 * @title Linx Integration
 * @description Cart loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<CartResponse | null> => {
  const { api } = ctx;

  const response = await api["POST /web-api/v1/Shopping/Basket/Get"]({}, {
    headers: req.headers,
    body: {},
  });

  if (response === null) {
    return null;
  }

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  const cart = await response.json();

  if (!cart) {
    throw new Error("Could not retrieve Basket");
  }

  return toCart(cart, ctx);
};

export default loader;

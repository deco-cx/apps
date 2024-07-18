import { getCookies, setCookie } from "std/http/cookie.ts";
import type { AppContext } from "../../linx/mod.ts";
import { proxySetCookie } from "../../utils/cookie.ts";
import { toLinxHeaders } from "../utils/headers.ts";
import { toCart } from "../utils/transform.ts";
import type { CartResponse } from "../utils/types/basketJSON.ts";

export function getLinxBasketId(headers: Headers): number | undefined {
  const cookies = getCookies(headers);
  if (!cookies) {
    return undefined;
  }
  return Number(cookies["linx-basket"]);
}

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

  const BasketID = getLinxBasketId(req.headers);

  const response = await api["POST /web-api/v1/Shopping/Basket/Get"]({}, {
    headers: toLinxHeaders(req.headers),
    body: {
      BasketID,
    },
  });

  if (response === null) {
    return null;
  }

  const cart = await response.json();

  if (!cart) {
    throw new Error("Could not retrieve Basket");
  }

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  setCookie(ctx.response.headers, {
    name: "linx-basket",
    value: String(cart.Shopper.Basket.BasketID),
  });

  return toCart(cart, ctx);
};

export default loader;

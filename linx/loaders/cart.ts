import { getCookies, setCookie } from "std/http/cookie.ts";
import type { AppContext } from "../../linx/mod.ts";
import { proxySetCookie } from "../../utils/cookie.ts";
import { toLinxHeaders } from "../utils/headers.ts";
import { toCart } from "../utils/transform.ts";
import type { CartResponse } from "../utils/types/basketJSON.ts";

export const DECO_LINX_BASKET_COOKIE = "d-linx-basket";

/**
 * Some Linx stores will need the BasketID for effectively
 * referencing a shopping session.
 * @param headers Incoming request headers
 * @returns
 */
export function getBasketHint(headers: Headers): number | undefined {
  const cookies = getCookies(headers);
  const basketId = cookies[DECO_LINX_BASKET_COOKIE];
  return basketId ? Number(basketId) : undefined;
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

  const cookies = getCookies(req.headers);

  for (const [a, b] of Object.entries(cookies)) {
    console.log(
      a, b
    );
  }

  const response = await api["POST /web-api/v1/Shopping/Basket/Get"]({}, {
    headers: toLinxHeaders(req.headers),
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

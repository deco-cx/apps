import { getCookies } from "std/http/cookie.ts";
import type { AppContext } from "../../linx/mod.ts";
import { proxySetCookie } from "../../utils/cookie.ts";
import { toLinxHeaders } from "../utils/headers.ts";
import { toCart } from "../utils/transform.ts";
import type { CartResponse } from "../utils/types/basketJSON.ts";

function shouldCreateLinxSession(headers: Headers): boolean {
  return true;
  // const cookies = getCookies(headers);
  // if (!cookies) {
  //   return true;
  // }

  // const hasSession = Boolean(cookies["tkt"]) && Boolean(cookies["lcsid"]);
  // return !hasSession;
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

  const response = await api["POST /web-api/v1/Shopping/Basket/Get"]({}, {
    headers: toLinxHeaders(req.headers),
    body: {},
  });

  if (response === null) {
    return null;
  }

  const cart = await response.json();

  if (!cart) {
    throw new Error("Could not retrieve Basket");
  }

  if (shouldCreateLinxSession(req.headers)) {
    proxySetCookie(response.headers, ctx.response.headers, req.url);
  }

  return toCart(cart, ctx);
};

export default loader;

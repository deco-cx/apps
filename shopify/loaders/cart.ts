import { AppContext } from "apps/shopify/mod.ts";
import { getCookies, getSetCookies, setCookie } from "std/http/mod.ts";
import { SHOPIFY_COOKIE_NAME } from "../utils/constants.ts";
import type { Cart } from "../utils/types.ts";

const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { client } = ctx;

  try {
    const r = await client.cart.create();

    const reqCookies = getCookies(req.headers);
    const cartIdCookie = reqCookies[SHOPIFY_COOKIE_NAME];
    if (cartIdCookie) {
      const queryResponse = await client.cart.get(cartIdCookie);
      if (!queryResponse?.cart?.id) {
        throw new Error("unable to create a cart");
      }
      return queryResponse;
    }

    if (!r?.payload?.cart.id) {
      throw new Error("unable to create a cart");
    }
    const { cart } = r.payload;

    const cookies = getSetCookies(ctx.response.headers);
    cookies.push({ name: SHOPIFY_COOKIE_NAME, value: cart.id });

    for (const cookie of cookies) {
      setCookie(ctx.response.headers, {
        ...cookie,
        domain: new URL(req.url).hostname,
      });
    }

    return { cart: { id: cart.id } };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default loader;

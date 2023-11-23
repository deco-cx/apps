import { AppContext } from "../mod.ts";
import { getCartCookie, setCartCookie } from "../utils/cart.ts";
import { OpenAPI } from "../utils/openapi/vnda.openapi.gen.ts";

export type Cart = {
  orderForm?: OpenAPI["POST /api/v2/carts"]["response"];
  relatedItems?: OpenAPI["POST /api/v2/carts"]["response"]["items"];
};

/**
 * @title VNDA Integration
 * @description Cart loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { api } = ctx;
  const cartId = getCartCookie(req.headers);
  const url = new URL(req.headers.get("referer") ?? "");
  const agent = url.searchParams.get("agent");

  const orderForm = cartId
    ? await api["GET /api/v2/carts/:cartId"]({ cartId })
      .then((res) => res.json())
    : await api["POST /api/v2/carts"]({}, { body: agent ? { agent } : {} })
      .then((res) => res.json());

  setCartCookie(ctx.response.headers, orderForm.id.toString());
  return {
    orderForm,
    relatedItems: orderForm.items ?? [],
  };
};

export default loader;

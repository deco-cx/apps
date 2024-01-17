import { AppContext } from "../mod.ts";
import { getAgentCookie, getCartCookie, setCartCookie } from "../utils/cart.ts";
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
  const agent = getAgentCookie(req.headers);

  let orderForm;

  try {
    orderForm = cartId
      ? await api["GET /api/v2/carts/:cartId"]({ cartId }).then((res) =>
        res.json()
      )
      : await api["POST /api/v2/carts"]({}, { body: {} }).then((res) =>
        res.json()
      );
  } catch (_error) {
    // Failed to get current cardId, creating a new orderForm
    orderForm = await api["POST /api/v2/carts"]({}, { body: {} }).then((res) =>
      res.json()
    );
  }

  const hasAgent = orderForm.agent === agent;

  if (!hasAgent && agent) {
    const [{ id }] = await api["GET /api/v2/users"]({ external_code: agent })
      .then((res) => res.json());
    await api["PATCH /api/v2/carts/:cartId"]({ cartId: orderForm.id }, {
      body: { agent, user_id: id },
    });
  }

  setCartCookie(ctx.response.headers, orderForm.id.toString());
  return {
    orderForm,
    relatedItems: orderForm.items ?? [],
  };
};

export default loader;

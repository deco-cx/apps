import { AppContext } from "../../mod.ts";
import { SHOPIFY_COOKIE_NAME } from "../../utils/constants.ts";
import { getCookies } from "std/http/mod.ts";
import type { Cart } from "../../utils/types.ts";

type UpdateLineProps = {
  lines: {
    merchandiseId: string;
    attributes?: Array<{ key: string; value: string }>;
    quantity?: number;
    sellingPlanId?: string;
  };
};

const action = async (
  props: UpdateLineProps,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { client } = ctx;

  const reqCookies = getCookies(req.headers);
  const cartId = reqCookies[SHOPIFY_COOKIE_NAME];
  const response = await client.cart.addItem({
    cartId: cartId,
    lines: [props.lines],
  });

  return response?.cartLinesAdd || { cart: { id: cartId } };
};

export default action;

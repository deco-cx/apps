import { HttpError } from "../../../utils/http.ts";
import cartLoader, { Cart } from "../../loaders/cart.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";

export interface Props {
  itemId: string;
  quantity: number;
  attributes: Record<string, string>;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { api } = ctx;
  const { itemId, quantity, attributes } = props;
  const cartId = getCartCookie(req.headers);

  if (!cartId) {
    throw new HttpError(400, "Missing cart cookie");
  }

  await api["POST /api/v2/carts/:cartId/items"]({ cartId }, {
    body: {
      sku: itemId,
      quantity,
      extra: attributes,
    },
  });

  return cartLoader({}, req, ctx);
};

export default action;

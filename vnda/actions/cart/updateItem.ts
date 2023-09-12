import { HttpError } from "../../../utils/http.ts";
import cartLoader, { Cart } from "../../loaders/cart.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";

export interface Props {
  itemId: number | string;
  quantity: number;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { api } = ctx;
  const { itemId, quantity } = props;
  const cartId = getCartCookie(req.headers);

  if (!cartId) {
    throw new HttpError(400, "Missing cart cookie");
  }

  if (quantity > 0) {
    await api["PATCH /api/v2/carts/:cartId/items/:itemId"]({ cartId, itemId }, {
      body: { quantity },
    });
  } else {
    await api["DELETE /api/v2/carts/:cartId/items/:itemId"]({ cartId, itemId });
  }

  return cartLoader({}, req, ctx);
};

export default action;

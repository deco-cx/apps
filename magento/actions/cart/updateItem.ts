import { Cart } from "../../loaders/cart.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";

export interface Props {
  qty: number;
  itemId: string;
  sku: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { qty, itemId, sku } = props;
  const { clientAdmin } = ctx;
  const cartId = getCartCookie(req.headers);

  const body = {
    "cartItem": {
      "qty": qty,
      "quote_id": cartId,
      "sku": sku,
    },
  };

  await clientAdmin["PUT /rest/:site/V1/carts/:cartId/items/:itemId"]({
    itemId,
    cartId: cartId,
    site: ctx.site,
  }, { body });

  return await clientAdmin["GET /rest/:site/V1/carts/:cartId"]({
    cartId: cartId,
    site: ctx.site,
  }).then((res) => res.json());
};

export default action;

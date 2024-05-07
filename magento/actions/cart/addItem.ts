import type { AppContext } from "../../mod.ts";
import cartLoader, { Cart } from "../../loaders/cart.ts";
import { getCartCookie } from "../../utils/cart.ts";

export interface Props {
  qty: number;
  quoteId: string;
  sku: string;
}
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { qty, quoteId, sku } = props;
  const { clientAdmin } = ctx;
  const cartId = getCartCookie(req.headers);

  const body = {
    "cartItem": {
      "qty": qty,
      "quote_id": quoteId,
      "sku": sku,
    },
  };

  await clientAdmin["POST /rest/:site/V1/carts/:quoteId/items"]({
    quoteId: cartId,
    site: ctx.site,
  }, { body });

  return cartLoader({}, req, ctx);
};

export default action;

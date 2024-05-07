import cartLoader, { Cart } from "../../loaders/cart.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";

export interface Props {
  qty: number;
  quoteId: string;
  itemId: string;
  sku: string;
}

const action = async (
  { qty, quoteId, sku, itemId }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { clientAdmin } = ctx;
  const cartIdCookie = getCartCookie(req.headers);

  if (qty > 0) {
    const body = {
      "cartItem": {
        "qty": qty,
        "quote_id": quoteId,
        "sku": sku,
      },
    };

    await clientAdmin["PUT /rest/:site/V1/carts/:cartId/items/:itemId"]({
      site: ctx.site,
      cartId: cartIdCookie,
      itemId,
    }, { body });
  }

  return cartLoader({}, req, ctx);
};

export default action;

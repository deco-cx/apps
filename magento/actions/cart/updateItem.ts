import { HttpError } from "../../../utils/http.ts";
import cartLoader, { Cart } from "../../loaders/cart.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";

export interface Props {
  qty: number;
  quote_id: string;
  sku: string;
}

const action = async (
  { qty, quote_id, sku, cartId, itemId }: Props & {
    cartId: string;
    itemId: string;
  },
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { clientAdmin } = ctx;
  const cartIdCookie = getCartCookie(req.headers);

  if (!cartIdCookie) {
    throw new HttpError(400, "Missing cart cookie");
  }

  if (qty > 0) {
    const decodedCartId = decodeURIComponent(cartId);

    const body = {
      "cartItem": {
        qty: qty,
        quote_id: quote_id,
        sku: sku,
      },
    };

    await clientAdmin["PUT /rest/:site/V1/carts/:cartId/items/:itemId"]({
      site: ctx.site,
      cartId: decodedCartId,
      itemId,
    }, { body });
  }

  return cartLoader({}, req, ctx);
};

export default action;

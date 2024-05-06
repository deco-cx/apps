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
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { clientAdmin } = ctx;

  const { qty, sku, quote_id } = props;

  const cartId = getCartCookie(req.headers);

  if (!cartId) {
    throw new HttpError(400, "Missing cart cookie");
  }

  const body = {
    "cartItem": {
      "qty": qty,
      "quote_id": quote_id,
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

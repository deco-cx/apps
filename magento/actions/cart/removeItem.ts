import { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";
import cart, { Cart } from "../../loaders/cart.ts";

export interface Props {
  itemId: string;
}

const action = async (
  { itemId }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { clientAdmin, site } = ctx;
  const cartId = getCartCookie(req.headers);

  await clientAdmin["DELETE /rest/:site/V1/carts/:cartId/items/:itemId"]({
    site,
    cartId: cartId,
    itemId,
  }, {});

  return await cart(undefined, req, ctx);
};

export default action;

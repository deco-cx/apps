import type { AppContext } from "../../mod.ts";
import cart, { Cart } from "../../loaders/cart.ts";
import { getCartCookie } from "../../utils/cart.ts";

const action = async (
  _props: undefined,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { clientAdmin } = ctx;
  const cartId = getCartCookie(req.headers);

  await clientAdmin["DELETE /rest/:site/V1/carts/:cartId/coupons"]({
    cartId,
    site: ctx.site,
  });

  return await cart(undefined, req, ctx)
};

export default action;

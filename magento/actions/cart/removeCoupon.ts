import type { AppContext } from "../../mod.ts";
import cart, { Cart } from "../../loaders/cart.ts";
import { getCartCookie, handleCartError } from "../../utils/cart.ts";

const action = async (
  _props: undefined,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { clientAdmin } = ctx;
  const cartId = getCartCookie(req.headers);

  try {
    await clientAdmin["DELETE /rest/:site/V1/carts/:cartId/coupons"]({
      cartId,
      site: ctx.site,
    });
  } catch (error) {
    return {
      ...(await cart(undefined, req, ctx)),
      ...handleCartError(error),
    };
  }

  return await cart(undefined, req, ctx);
};

export default action;

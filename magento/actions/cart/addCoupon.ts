import cart, { Cart } from "../../loaders/cart.ts";
import type { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";

export interface Props {
  couponCode: string;
}
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | string> => {
  const { couponCode } = props;
  const { clientAdmin } = ctx;
  const cartId = getCartCookie(req.headers);

  try {
    await clientAdmin["PUT /rest/:site/V1/carts/:cartId/coupons/:couponCode"]({
      cartId,
      site: ctx.site,
      couponCode: couponCode.toLowerCase(),
    }).then((res) => res.json());
  } catch (error) {
    if (error.status === 404) {
      return "Invalid or applied coupon code";
    }
  }
  return await cart(undefined, req, ctx);
};

export default action;

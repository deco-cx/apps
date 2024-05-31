import type { AppContext } from "../../mod.ts";
import { Cart } from "../../loaders/cart.ts";
import { getCartCookie } from "../../utils/cart.ts";

export interface Props {
  couponCode: string;
}
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { couponCode } = props;
  const { clientAdmin } = ctx;
  const cartId = getCartCookie(req.headers);

  await clientAdmin["POST /rest/:site/V1/carts/:cartId/coupons/:couponCode"]({
    cartId,
    site: ctx.site,
    couponCode,
  });

  return await ctx.invoke(
    "magento/loaders/cart.ts",
  );
};

export default action;

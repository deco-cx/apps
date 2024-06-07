import { HttpError } from "../../../utils/http.ts";
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
      couponCode: couponCode,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return JSON.parse(error.message).message;
    }
    return error;
  }

  return await cart(undefined, req, ctx);
};

export default action;

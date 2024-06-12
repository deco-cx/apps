import { HttpError } from "../../../utils/http.ts";
import cart, { Cart } from "../../loaders/cart.ts";
import type { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";

export interface Props {
  couponCode: string;
}

interface ErrorAddCoupon {
    message: string;
    status: number;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | ErrorAddCoupon> => {
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
      return {
        ...await cart(undefined, req, ctx),
        message: JSON.parse(error.message).message,
        status: error.status,
      }
    }
    return error;
  }

  return await cart(undefined, req, ctx);
};

export default action;
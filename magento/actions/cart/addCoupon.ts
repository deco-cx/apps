import { Cart } from "../../loaders/cart.ts";
import type { AppContext } from "../../mod.ts";
import { getCartCookie, handleCartActions } from "../../utils/cart.ts";
import { OverrideFeatures } from "../../utils/client/types.ts";

export interface Props extends OverrideFeatures {
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
): Promise<Cart | ErrorAddCoupon | null> => {
  const { couponCode, dangerouslyOverrideReturnNull } = props;
  const { clientAdmin, features } = ctx;
  const dontReturnCart = dangerouslyOverrideReturnNull ??
    features.dangerouslyReturnNullAfterAction;

  const cartId = getCartCookie(req.headers);
  try {
    await clientAdmin["PUT /rest/:site/V1/carts/:cartId/coupons/:couponCode"]({
      cartId,
      site: ctx.site,
      couponCode: couponCode,
    });
  } catch (error) {
    console.error(error);
    return handleCartActions(dontReturnCart, {
      req,
      ctx,
      error,
    });
  }

  return handleCartActions(dontReturnCart, {
    req,
    ctx,
  });
};
export default action;

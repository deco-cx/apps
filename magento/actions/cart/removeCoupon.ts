import type { AppContext } from "../../mod.ts";
import { Cart } from "../../loaders/cart.ts";
import { getCartCookie, handleCartActions } from "../../utils/cart.ts";
import { OverrideFeatures } from "../../utils/client/types.ts";

type Props = OverrideFeatures;

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { clientAdmin, features } = ctx;
  const { dangerouslyDontReturnCart } = props;
  const dontReturnCart = dangerouslyDontReturnCart ??
    features.dangerouslyDontReturnCartAfterAction;

  const cartId = getCartCookie(req.headers);

  try {
    await clientAdmin["DELETE /rest/:site/V1/carts/:cartId/coupons"]({
      cartId,
      site: ctx.site,
    });
  } catch (error) {
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

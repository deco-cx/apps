import { AppContext } from "../../mod.ts";
import { getCartCookie, handleCartActions } from "../../utils/cart.ts";
import { OverrideFeatures } from "../../utils/client/types.ts";
import { Cart } from "../../loaders/cart.ts";

export interface Props extends OverrideFeatures {
  itemId: string;
}

const action = async (
  { itemId, dangerouslyDontReturnCart }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { clientAdmin, site, features } = ctx;
  const dontReturnCart = dangerouslyDontReturnCart ??
    features.dangerouslyDontReturnCartAfterAction;

  const cartId = getCartCookie(req.headers);

  try {
    await clientAdmin["DELETE /rest/:site/V1/carts/:cartId/items/:itemId"](
      {
        site,
        cartId: cartId,
        itemId,
      },
      {},
    );
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

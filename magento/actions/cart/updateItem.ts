import { Cart } from "../../loaders/cart.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie, handleCartActions } from "../../utils/cart.ts";
import { OverrideFeatures } from "../../utils/client/types.ts";

export interface Props extends OverrideFeatures {
  qty: number;
  itemId: string;
  sku: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { qty, itemId, sku, dangerouslyOverrideReturnNull } = props;
  const { clientAdmin, features } = ctx;
  const dontReturnCart = dangerouslyOverrideReturnNull ??
    features.dangerouslyReturnNullAfterAction;

  const cartId = getCartCookie(req.headers);

  const body = {
    cartItem: {
      qty: qty,
      quote_id: cartId,
      sku: sku,
    },
  };

  try {
    await clientAdmin["PUT /rest/:site/V1/carts/:cartId/items/:itemId"](
      {
        itemId,
        cartId: cartId,
        site: ctx.site,
      },
      { body },
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

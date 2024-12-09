import { AppContext } from "../../mod.ts";
import { getCartCookie, handleCartActions } from "../../utils/cart.ts";
import { OverrideFeatures } from "../../utils/client/types.ts";
import { Cart } from "../../loaders/cart.ts";
import { RemoveItemFromCart } from "../../utils/graphql/queries.ts";
import {
  RemoveItemFromCartInput,
  RemoveItemFromCartOutput,
} from "../../utils/graphql/storefront.graphql.gen.ts";

export interface Props extends OverrideFeatures {
  itemId: string;
}

/**
 * @title Magento Integration - Remove Item
 * @description Remove item action
 */
const action = async (
  { itemId, dangerouslyOverrideReturnNull }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { clientAdmin, site, features, clientGraphql } = ctx;
  const dontReturnCart = dangerouslyOverrideReturnNull ??
    features.dangerouslyReturnNullAfterAction;

  const cartId = getCartCookie(req.headers);

  try {
    await clientGraphql.query<
      RemoveItemFromCartOutput,
      RemoveItemFromCartInput
    >({
      variables: {
        cartId,
        itemId,
      },
      ...RemoveItemFromCart,
    });
    // await clientAdmin["DELETE /rest/:site/V1/carts/:cartId/items/:itemId"](
    //   {
    //     site,
    //     cartId: cartId,
    //     itemId,
    //   },
    //   {},
    // );
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

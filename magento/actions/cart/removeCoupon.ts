import type { AppContext } from "../../mod.ts";
import { Cart } from "../../loaders/cart.ts";
import { getCartCookie, handleCartActions } from "../../utils/cart.ts";
import { OverrideFeatures } from "../../utils/client/types.ts";
import {
  RemoveCouponFromCartInput,
  RemoveCouponFromCartOutput,
} from "../../utils/graphql/storefront.graphql.gen.ts";
import { RemoveCouponFromCart } from "../../utils/graphql/queries.ts";

type Props = OverrideFeatures;

/**
 * @title Magento Integration - Remove coupon
 * @description Remove coupon action
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { clientAdmin, clientGraphql, features } = ctx;
  const { dangerouslyOverrideReturnNull } = props;
  const dontReturnCart = dangerouslyOverrideReturnNull ??
    features.dangerouslyReturnNullAfterAction;

  const cartId = getCartCookie(req.headers);

  try {
    await clientGraphql.query<
      RemoveCouponFromCartOutput,
      RemoveCouponFromCartInput
    >({
      variables: {
        cartId,
      },
      ...RemoveCouponFromCart,
    });
    // await clientAdmin["DELETE /rest/:site/V1/carts/:cartId/coupons"]({
    //   cartId,
    //   site: ctx.site,
    // });
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

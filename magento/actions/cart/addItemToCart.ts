import type { AppContext } from "../../mod.ts";
import cart, { Cart } from "../../loaders/cart.ts";
import {
  getCartCookie,
  handleCartError,
  postNewItem,
} from "../../utils/cart.ts";

export interface Props {
  qty: number;
  sku: string;
  productId: string;
}

/**
 * @title Magento Integration - Add item to cart
 * @description Add item action
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { qty, sku } = props;
  const { clientAdmin } = ctx;
  const cartId = getCartCookie(req.headers);

  try {
    await postNewItem(
      ctx.site,
      cartId,
      {
        cartItem: {
          qty: qty,
          quote_id: cartId,
          sku,
        },
      },
      clientAdmin,
      req.headers,
    );
    return await cart(undefined, req, ctx);
  } catch (error) {
    return {
      ...(await cart(undefined, req, ctx)),
      ...handleCartError(error),
    };
  }
};

export default action;

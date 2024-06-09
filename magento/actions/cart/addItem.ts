import type { AppContext } from "../../mod.ts";
import cart, { Cart } from "../../loaders/cart.ts";
import {
  createCart,
  getCartCookie,
  postNewItem,
  setCartCookie,
} from "../../utils/cart.ts";

export interface Props {
  qty: number;
  sku: string;
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
  const { clientAdmin, cartConfigs } = ctx;
  const { createCartOnAddItem } = cartConfigs;
  const cartId = getCartCookie(req.headers);

  const body = {
    "cartItem": {
      "qty": qty,
      "quote_id": cartId,
      "sku": sku,
    },
  };

  if (createCartOnAddItem && !cartId) {
    const newCartId = (await createCart(ctx, req.headers)).id.toString()
    if (!newCartId.length) return null;
    body.cartItem.quote_id = newCartId;
    await postNewItem(ctx.site, newCartId, body, clientAdmin);
    setCartCookie(req.headers, newCartId);
    return await cart(undefined, req, ctx);
  }

  await postNewItem(ctx.site, cartId, body, clientAdmin);
  return await cart(undefined, req, ctx);
};

export default action;

import type { AppContext } from "../../mod.ts";
import cart, { Cart } from "../../loaders/cart.ts";
import {
  createCart,
  getCartCookie,
  handleCartError,
  postNewItem,
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

  const addItemToCart = async (req: Request, cartId: string) => {
    try {
      await postNewItem(ctx.site, cartId, body, clientAdmin, req.headers);
      return cart(undefined, req, ctx);
    } catch (error) {
      return {
        ...(await cart(undefined, req, ctx)),
        ...handleCartError(error),
      };
    }
  };

  const body = {
    cartItem: {
      qty: qty,
      quote_id: cartId,
      sku,
    },
  };

  if (createCartOnAddItem && !cartId) {
    const newCartId = (await createCart(ctx, req.headers, true))?.id.toString();
    if (!newCartId?.length) {
      return null;
    }
    body.cartItem.quote_id = newCartId;
    const headers = new Headers(req.headers);
    headers.set("cookie", ctx.response.headers.getSetCookie()[0]);
    const newReq = { ...req, headers, url: req.url };
    return addItemToCart(newReq, newCartId);
  }

  return addItemToCart(req, cartId);
};

export default action;

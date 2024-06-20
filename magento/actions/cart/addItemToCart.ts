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
  console.log("adicionando item no carinho pela action antigo")
  const { qty, sku } = props;
  const { clientAdmin, baseUrl, site } = ctx;
  const cartId = getCartCookie(req.headers);

  // try {
  //   await postNewItem(
  //     site,
  //     cartId,
  //     {
  //       cartItem: {
  //         qty: qty,
  //         quote_id: cartId,
  //         sku,
  //       },
  //     },
  //     clientAdmin,
  //     req.headers,
  //   );
  // } catch (_error) {
  //   throw new Error(`via client admin, cartId ${cartId}, sku: ${sku}, qty: ${qty}, error: ${_error}`);
  // }
  try {
   return await fetch(`${baseUrl}/rest/${site}/V1/carts/${cartId}/items`, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({
        cartItem: {
          qty: qty,
          quote_id: cartId,
          sku,
        },
      }),
    }) as unknown as Cart
  } catch (_error) {
    throw new Error(`via fetch, cartId ${cartId}, sku: ${sku}, qty: ${qty}, error: ${_error}`);
  }
  try {
    return await cart(undefined, req, ctx);
  } catch (_error) {
    throw new Error(`via loader cart cart, cartId ${cartId}, sku: ${sku}, qty: ${qty}, error: ${_error}`);
  }
    
};

export default action;

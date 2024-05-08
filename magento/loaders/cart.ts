import { AppContext } from "../mod.ts";
import { API } from "../utils/client/client.ts";
import { createCart, getCartCookie, setCartCookie } from "../utils/cart.ts";

export type Cart = API["GET /rest/:site/V1/carts/:cartId"]["response"];

/**
 * @title Magento Integration
 * @description Cart loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { clientAdmin, site } = ctx;

  const cartId = getCartCookie(req.headers);

  const getCart = async (cartId: string): Promise<Cart> => {
    if (!cartId) {
      return await createCart(ctx, req.headers);
    } else {
      try {
        const result = await clientAdmin["GET /rest/:site/V1/carts/:cartId"]({
          cartId,
          site,
        });

        return await result.json();
      } catch (_error) {
        return await createCart(ctx, req.headers);
      }
    }
  };

  const cartDetails = cartId ? await getCart(cartId) : await getCart("");

  if (cartDetails.id && !cartId) {
    setCartCookie(ctx.response.headers, cartDetails.id.toString());
  }

  return cartDetails;
};
export default loader;

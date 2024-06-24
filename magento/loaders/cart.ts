import { AppContext } from "../mod.ts";
import { getCartCookie, toCartItemsWithImages } from "../utils/cart.ts";
import { Cart as CartFromDeco } from "../utils/client/types.ts";
import {
  BASE_CURRENCY_CODE,
  BASE_DISCOUNT_AMOUNT,
  BASE_SHIPPING_AMOUNT,
  COUPON_CODE,
  DISCOUNT_AMOUNT,
  GRAND_TOTAL,
  SHIPPING_AMOUNT,
  SHIPPING_DISCOUNT_AMOUNT,
  SUBTOTAL,
} from "../utils/constants.ts";
import getImages from "./product/images.ts";

export type Cart = CartFromDeco;

interface Props {
  cartId?: string;
}

/**
 * @title Magento Integration - Cart
 * @description Cart loader
 */
const loader = async (
  { cartId: _cartId }: Props = { cartId: undefined },
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { clientAdmin, site, cartConfigs } = ctx;
  const { countProductImageInCart } = cartConfigs;
  const url = new URL(req.url);
  const cartId = _cartId ?? getCartCookie(req.headers);

  if (!cartId) {
    return null;
  }

  const [resultPricesCarts, resultCart] = await Promise.all([
    clientAdmin["GET /rest/:site/V1/carts/:cartId/totals"]({
      cartId,
      site,
      fields: [
        GRAND_TOTAL,
        SUBTOTAL,
        DISCOUNT_AMOUNT,
        BASE_DISCOUNT_AMOUNT,
        SHIPPING_AMOUNT,
        BASE_SHIPPING_AMOUNT,
        SHIPPING_DISCOUNT_AMOUNT,
        COUPON_CODE,
        BASE_CURRENCY_CODE,
      ].join(","),
    }),
    clientAdmin["GET /rest/:site/V1/carts/:cartId"]({
      cartId,
      site,
    }),
  ]);

  const [cart, prices] = await Promise.all([
    resultCart.json(),
    resultPricesCarts.json(),
  ]);

  if (cart.items.length === 0) {
    return toCartItemsWithImages(
      cart,
      prices,
      {
        items: [],
      },
      url.origin,
      site,
      countProductImageInCart,
    );
  }

  const { products } = await getImages({ cart }, req, ctx);

  return toCartItemsWithImages(
    cart,
    prices,
    products,
    url.origin,
    site,
    countProductImageInCart,
  );
};
export default loader;

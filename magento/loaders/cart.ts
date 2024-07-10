import {
  default as extend,
} from "../../website/loaders/extension.ts";
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
  disableExtensions?: boolean;
}

/**
 * @title Magento Integration - Cart
 * @description Cart loader
 */
const loader = async (
  { cartId: _cartId, disableExtensions }: Props = {
    cartId: undefined,
    disableExtensions: false,
  },
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { clientAdmin, site, cartConfigs } = ctx;
  const { countProductImageInCart, extensions } = cartConfigs;
  const url = new URL(req.url);
  const cartId = _cartId ?? getCartCookie(req.headers);

  if (!cartId) {
    return null;
  }

  const [prices, cart] = await Promise.all([
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
    }).then((c) => c.json()),
    clientAdmin["GET /rest/:site/V1/carts/:cartId"]({
      cartId,
      site,
    }).then((c) => c.json()),
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

  const cartWithImages = toCartItemsWithImages(
    cart,
    prices,
    products,
    url.origin,
    site,
    countProductImageInCart,
  );

  if (extensions && !disableExtensions) {
    return await extend<Cart | null>({ data: cartWithImages, extensions });
  }

  return cartWithImages;
};

export default loader;

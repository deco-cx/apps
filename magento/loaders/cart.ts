import { AppContext } from "../mod.ts";
import {
  getCartCookie,
  toCartItemsWithImages
} from "../utils/cart.ts";
import { Cart as CartFromDeco } from "../utils/client/types.ts";
import {
  BASE_CURRENCY_CODE,
  BASE_DISCOUNT_AMOUNT,
  BASE_SHIPPING_AMOUNT,
  COUPON_CODE,
  DISCOUNT_AMOUNT,
  GRAND_TOTAL,
  MEDIA_GALLERY_ENTRIES,
  SHIPPING_AMOUNT,
  SHIPPING_DISCOUNT_AMOUNT,
  SKU,
  SUBTOTAL,
} from "../utils/constants.ts";

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
  const { clientAdmin, site, imagesUrl, cartConfigs } = ctx;
  const { countProductImageInCart } = cartConfigs;
  const url = new URL(req.url);
  const cartId = _cartId ?? getCartCookie(req.headers);
  console.log({ cartId });

  if (!cartId) return null;

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

  const cart = await resultCart.json();
  const prices = await resultPricesCarts.json();

  const productImagePromises = cart.items.map((item) => {
    return clientAdmin["GET /rest/:site/V1/products/:sku"]({
      sku: item.sku,
      site,
      fields: [MEDIA_GALLERY_ENTRIES, SKU, "url", "custom_attributes"]
        .join(","),
    }).then((res) => res.json());
  });
  const productImages = await Promise.all(productImagePromises);

  return toCartItemsWithImages(
    cart,
    prices,
    productImages,
    imagesUrl,
    url.origin,
    site,
    countProductImageInCart,
  ) as unknown as Cart;
};
export default loader;

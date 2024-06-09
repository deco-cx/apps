import { AppContext } from "../mod.ts";
import { API } from "../utils/client/client.ts";
import {
  createCart,
  getCartCookie,
  toCartItemsWithImages,
} from "../utils/cart.ts";
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

export type Cart = API["GET /rest/:site/V1/carts/:cartId"]["response"];

/**
 * @title Magento Integration - Cart
 * @description Cart loader
 */
const loader = async (
  _props: undefined,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { clientAdmin, site, imagesUrl, cartConfigs } = ctx;
  const { contProductImageInCart, createCartOnAddItem } = cartConfigs;
  const url = new URL(req.url);
  const cartId = getCartCookie(req.headers);

  const getCart = async (cartId: string): Promise<Cart | null> => {
    if (!createCartOnAddItem && !cartId) {
      return await createCart(ctx, req.headers);
    }
    if (createCartOnAddItem && !cartId) return null;
    try {
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

      const cart = await resultCart.json() as Cart;
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
        contProductImageInCart,
      ) as unknown as Cart;
    } catch (_error) {
      return createCart(ctx, req.headers);
    }
  };

  return await getCart(cartId);
};
export default loader;

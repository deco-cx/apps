import { AppContext } from "../mod.ts";
import {
  getCartCookie,
  getCartImages,
  toCartItemsWithImages,
} from "../utils/cart.ts";
import { Cart as CartFromDeco, CartFromAPI } from "../utils/client/types.ts";
import { ProductWithImages } from "../utils/clientGraphql/types.ts";
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

export type Cart = CartFromDeco;

export const IMAGES_CACHE_NAME = "product-images-cache";

interface Props {
  cartId?: string;
}

interface HandledImages {
  cachedImages: ProductWithImages[];
  nonCachedImagesSkus: string[];
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

  const { cachedImages, nonCachedImagesSkus } = await handleCachedImages(
    cart,
    url,
  );
  const nonCachedImages = await handleNonCachedImages(
    { ctx, url },
    nonCachedImagesSkus,
  );

  return toCartItemsWithImages(
    cart,
    prices,
    {
      items: [...cachedImages, ...nonCachedImages],
    },
    url.origin,
    site,
    countProductImageInCart,
  );
};
export default loader;

const handleCachedImages = async (
  { items }: CartFromAPI,
  url: URL,
): Promise<HandledImages> => {
  const cachedImages: ProductWithImages[] = [];
  const nonCachedImagesSkus: string[] = [];
  const promises = items.map(async ({ sku }) => {
    const image = await getCachedImages(sku, url);
    if (image) {
      cachedImages.push(image);
      return;
    }
    nonCachedImagesSkus.push(sku);
  });

  await Promise.all(promises);

  return {
    cachedImages,
    nonCachedImagesSkus,
  };
};

const handleNonCachedImages = async (
  options: { ctx: AppContext; url: URL },
  skus?: string[],
) => {
  if (!skus || skus.length === 0) {
    return [];
  }
  const { items } = (await getCartImages(skus, options.ctx)).products;
  for (const i in items) {
    putImageInCache(items[i], options.url);
  }

  return items;
};

const getCachedImages = async (
  sku: string,
  url: URL,
): Promise<ProductWithImages | null> => {
  const cacheKey = new URL(`images-${sku}`, url.origin);
  const cache = await caches.open(IMAGES_CACHE_NAME);
  const cachedResponse = await cache.match(cacheKey);

  if (cachedResponse) {
    return await cachedResponse.json() as ProductWithImages;
  }
  return null;
};

const putImageInCache = async (images: ProductWithImages, url: URL) => {
  const cacheKey = new URL(`images-${images.sku}`, url.origin);
  const cache = await caches.open(IMAGES_CACHE_NAME);
  const responseToCache = new Response(JSON.stringify(images));
  await cache.put(cacheKey, responseToCache);
};

import { AppContext } from "../mod.ts";
import { getCartImages } from "./cart.ts";
import { CartFromAPI } from "./client/types.ts";
import {
  ProductWithImages,
  ProductWithImagesGraphQL,
} from "./clientGraphql/types.ts";
export const IMAGES_CACHE_NAME = "product-images-cache";

interface HandledImages {
  cachedImages: ProductWithImages[];
  nonCachedImagesSkus: string[];
}

export const handleCartImages = async (
  cart: CartFromAPI,
  url: URL,
  ctx: AppContext,
): Promise<ProductWithImagesGraphQL["products"]> => {
  const { cachedImages, nonCachedImagesSkus } = await handleCachedImages(
    cart,
    url,
  );
  const nonCachedImages = await handleNonCachedImages(
    { skus: nonCachedImagesSkus, url, ctx },
  );
  return {
    items: [...cachedImages, ...nonCachedImages],
  };
};

const handleCachedImages = async (
  { items }: CartFromAPI,
  url: URL,
): Promise<HandledImages> => {
  const imagesPromises = await Promise.all(items.map(async ({ sku }) => ({
    image: await getCachedImages(sku, url),
    sku,
  })));

  const handledCachedImages = imagesPromises.reduce<HandledImages>(
    (acc, { image, sku }) => {
      if (image) {
        return {
          cachedImages: [...acc.cachedImages, image],
          nonCachedImagesSkus: acc.nonCachedImagesSkus,
        } as HandledImages;
      }
      return {
        cachedImages: acc.cachedImages,
        nonCachedImagesSkus: [...acc.nonCachedImagesSkus, sku],
      };
    },
    { cachedImages: [], nonCachedImagesSkus: [] } as HandledImages,
  );

  return handledCachedImages;
};

const handleNonCachedImages = async (
  { skus, url, ctx }: { skus?: string[]; url: URL; ctx: AppContext },
) => {
  if (!skus || skus.length === 0) {
    return [];
  }
  const { items } = (await getCartImages(skus, ctx)).products;

  for (const i in items) {
    putImageInCache(items[i], url);
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

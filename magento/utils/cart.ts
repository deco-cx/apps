import { getCookies } from "std/http/cookie.ts";
import { AppContext } from "../mod.ts";
import { Cart, MagentoCardPrices, MagentoProduct, MediaEntry } from "./client/types.ts";
import { toURL } from "./transform.ts";

const CART_COOKIE = "dataservices_cart_id";
const CART_CUSTOMER_COOKIE = "dataservices_customer_id";

const ONE_WEEK_MS = 7 * 24 * 3600 * 1_000;

export const getCartCookie = (headers: Headers): string => {
  const cookies = getCookies(headers);
  return decodeURIComponent(cookies[CART_COOKIE] || "").replace(/"/g, "");
};

export const setCartCookie = (headers: Headers, cartId: string) => {
  const encodedCartId = encodeURIComponent(`"${cartId}"`);
  const cookie = `${CART_COOKIE}=${encodedCartId}; Path=/; Expires=${
    new Date(Date.now() + ONE_WEEK_MS).toUTCString()
  }; SameSite=Lax`;
  headers.append("Set-Cookie", cookie);
};

export async function createCart(
  { clientAdmin, site }: AppContext,
  headers: Headers,
) {
  const cartCookie = getCookies(headers)[CART_COOKIE];

  const customerCookie = getCookies(headers)[CART_CUSTOMER_COOKIE];

  if (!cartCookie && !customerCookie) {
    const tokenCart = await clientAdmin["POST /rest/:site/V1/guest-carts"]({
      site,
    }).then((res) => res.json());
    const cart = await clientAdmin["GET /rest/:site/V1/guest-carts/:cartId"]({
      cartId: tokenCart,
      site,
    }).then((res) => res.json());
    return await clientAdmin["GET /rest/:site/V1/carts/:cartId"]({
      cartId: cart.id,
      site,
    }).then((res) => res.json());
  } else {
    return await clientAdmin["GET /rest/:site/V1/carts/:cartId"]({
      cartId: cartCookie,
      site,
    }).then((res) => res.json());
  }
}

export const toCartItemsWithImages = (
  cart: Cart,
  prices: MagentoCardPrices,
  productImages: MagentoProduct[],
  imagesUrl: string,
) => {
  const productImagesMap = productImages.reduce((map, productImage) => {
    map[productImage.sku] = productImage.media_gallery_entries || [];
    return map;
  }, {} as Record<string, MediaEntry[]>);

  const itemsWithImages = cart.items.map((product) => {
    const images = productImagesMap[product.sku]?.map((img) => ({
      "@type": "ImageObject" as const,
      encodingFormat: "image",
      alternateName: img.file,
      url: `${toURL(imagesUrl)}${img.file}`,
    })) || [];

    return {
      ...product,
      price_total: product.qty * product.price,
      images,
    };
  });

  return {
    ...cart,
    items: itemsWithImages,
    totalizers: prices,
  };
};

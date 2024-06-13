import { getCookies, setCookie } from "std/http/cookie.ts";
import { AppContext } from "../mod.ts";
import { Cart, MagentoCardPrices, MagentoProduct } from "./client/types.ts";
import { toURL } from "./transform.ts";
import { ImageObject } from "../../commerce/types.ts";
import { SESSION_COOKIE } from "./constants.ts";
import { generateUniqueIdentifier } from "./hash.ts";

const CART_COOKIE = "dataservices_cart_id";
const CART_CUSTOMER_COOKIE = "dataservices_customer_id";

const ONE_WEEK_MS = 7 * 24 * 3600 * 1_000;

export const getCartCookie = (headers: Headers): string => {
  const cookies = getCookies(headers);
  const cartCookie = cookies[CART_COOKIE];
  if (cookies && cartCookie) {
    const decodedCookie = decodeURIComponent(cartCookie || "").replace(
      /"/g,
      ""
    );
    return decodedCookie;
  }

  const setCookieHeader = headers.get("Set-Cookie");
  if (setCookieHeader) {
    const match = setCookieHeader.match(new RegExp(`${CART_COOKIE}=([^;]+)`));
    if (match && match[1]) {
      return decodeURIComponent(match[1]).replace(/"/g, "");
    }
  }
  return "";
};

export const setCartCookie = (headers: Headers, cartId: string) => {
  const encodedCartId = encodeURIComponent(`"${cartId}"`);
  const cookie = `${CART_COOKIE}=${encodedCartId}; Path=/; Expires=${new Date(
    Date.now() + ONE_WEEK_MS
  ).toUTCString()}; SameSite=Lax`;
  headers.append("Set-Cookie", cookie);
};

export async function createCart(
  { clientAdmin, site, response }: AppContext,
  headers: Headers,
  forceNewCart = false
) {
  const cartCookie = getCartCookie(headers);
  const customerCookie = getCookies(headers)[CART_CUSTOMER_COOKIE];
  const sessionCookie = getCookies(headers)[SESSION_COOKIE];

  if (!sessionCookie) {
    setCookie(headers, {
      path: "/",
      maxAge: ONE_WEEK_MS,
      name: SESSION_COOKIE,
      value: (await generateUniqueIdentifier()).hash,
    });
  }

  if ((!cartCookie && !customerCookie) || forceNewCart) {
    const newCart = await createNewCart({ clientAdmin, site });
    setCartCookie(response.headers, newCart.id.toString());
    return newCart;
  }

  return await clientAdmin["GET /rest/:site/V1/carts/:cartId"]({
    cartId: cartCookie,
    site,
  }).then((res) => res.json());
}

const createNewCart = async ({
  clientAdmin,
  site,
}: Pick<AppContext, "clientAdmin" | "site">) => {
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
};

export const toCartItemsWithImages = (
  cart: Cart,
  prices: MagentoCardPrices,
  productMagento: MagentoProduct[],
  imagesUrl: string,
  url: string,
  site: string,
  countProductImageInCart: number
) => {
  const productImagesMap = productMagento.reduce((map, productImage) => {
    map[productImage.sku] = productImage || [];
    return map;
  }, {} as Record<string, MagentoProduct>);

  const itemsWithImages = cart.items.map((product) => {
    const images = productImagesMap[product.sku].media_gallery_entries;
    const productData = productImagesMap[product.sku];
    const selectedImages = images?.slice(0, countProductImageInCart).map(
      (image) =>
        ({
          "@type": "ImageObject" as const,
          encodingFormat: "image",
          alternateName: image.file,
          url: `${toURL(imagesUrl)}${image.file}`,
        } as ImageObject)
    );

    const urlKey = productData.custom_attributes.find(
      (item) => item.attribute_code === "url_key"
    )?.value;

    return {
      ...product,
      price_total: product.qty * product.price,
      images: selectedImages,
      url: `${url}/${site}/${urlKey}`,
    };
  });

  return {
    ...cart,
    items: itemsWithImages,
    totalizers: {
      grand_total: prices.grand_total,
      subtotal: prices.subtotal,
      discount_amount: prices.discount_amount,
      shipping_amount: prices.shipping_amount,
      shipping_discount_amount: prices.shipping_discount_amount,
      base_currency_code: prices?.base_currency_code,
      base_discount_amount: prices.base_discount_amount,
      base_shipping_amount: prices.base_shipping_amount,
      base_subtotal: prices.base_subtotal,
      coupon_code: prices.coupon_code,
    },
  };
};

export async function postNewItem(
  site: string,
  cartId: string,
  body: {
    cartItem: {
      qty: number;
      quote_id: string;
      sku: string;
    };
  },
  clientAdmin: AppContext["clientAdmin"]
): Promise<void> {
  await clientAdmin["POST /rest/:site/V1/carts/:quoteId/items"](
    {
      quoteId: cartId,
      site: site,
    },
    { body }
  );
}

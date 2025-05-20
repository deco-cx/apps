import { getCookies } from "std/http/cookie.ts";
import { ImageObject } from "../../commerce/types.ts";
import { HttpError } from "../../utils/http.ts";
import cart, { Cart } from "../loaders/cart.ts";
import { AppContext } from "../mod.ts";
import {
  CartFromAPI,
  ItemsWithDecoImage,
  MagentoCardPrices,
} from "./client/types.ts";
import { ProductWithImagesGraphQL } from "./clientGraphql/types.ts";
import { setCookie } from "@std/http/cookie";

export const CART_COOKIE = "dataservices_cart_id";

export const getCartCookie = (headers: Headers): string => {
  const cookies = getCookies(headers);
  const cartCookie = cookies[CART_COOKIE];
  if (cookies && cartCookie) {
    const decodedCookie = decodeURIComponent(cartCookie || "").replace(
      /"/g,
      "",
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

export const toCartItemsWithImages = (
  cart: CartFromAPI,
  prices: MagentoCardPrices,
  { items }: ProductWithImagesGraphQL["products"],
  url: string,
  site: string,
  countProductImageInCart: number,
): Cart => {
  const itemsWithImages = cart.items.map<ItemsWithDecoImage>((product) => {
    const productData = items.find(({ sku }) => sku === product.sku);
    const images = productData?.media_gallery;
    const selectedImages = images?.sort((a, b) => a.position - b.position)
      .reduce<ImageObject[]>((acc, media) => {
        if (acc.length === countProductImageInCart) {
          return acc;
        }
        return [...acc, {
          "@type": "ImageObject" as const,
          encodingFormat: "image",
          alternateName: product.name,
          url: media.url,
        }];
      }, []);

    const urlKey = productData?.url_key;

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
  clientAdmin: AppContext["clientAdmin"],
  headers: Headers,
): Promise<void> {
  await clientAdmin["POST /rest/:site/V1/carts/:quoteId/items"](
    {
      quoteId: cartId,
      site: site,
    },
    { body, headers },
  );
}

export const handleCartError = (
  // deno-lint-ignore no-explicit-any
  error: any,
) => {
  if (error instanceof HttpError) {
    return {
      message: JSON.parse(error.message).message,
      status: error.status,
    };
  }
  return error;
};

export async function handleCartActions(dontReturnCart: boolean, settings: {
  req: Request;
  ctx: AppContext;
  // deno-lint-ignore no-explicit-any
  error?: any;
  cartId?: string;
}) {
  const { error, cartId } = settings;
  const handledError = error ? handleCartError(error) as Cart : undefined;

  if (dontReturnCart) {
    return handledError ?? null;
  }

  return {
    ...(await cart({ cartId }, settings.req, settings.ctx)),
    ...handledError,
  } as Cart;
}

export async function getCartImages(
  skus: Array<string>,
  ctx: AppContext,
) {
  const products = await ctx.clientAdmin["GET /rest/:site/V1/products/"]({
    site: ctx.site,
    "searchCriteria[filter_groups][0][filters][0][field]": "sku",
    "searchCriteria[filter_groups][0][filters][0][value]": skus.join(","),
    "searchCriteria[filter_groups][0][filters][0][condition_type]": "in",
    fields:
      "items[sku,name,url_key,media_gallery_entries[file,types,disabled,label,position],custom_attributes[url_key]]",
    "searchCriteria[pageSize]": skus.length,
  }).then((res) => res.json());

  const items = products.items.map((product) => {
    return {
      name: product.name,
      sku: product.sku,
      url_key: product.custom_attributes?.["1"].value,
      media_gallery: product.media_gallery_entries.map((entry) => {
        return {
          types: entry.types,
          disabled: entry.disabled,
          label: entry.label,
          position: entry.position,
          url: `${ctx.baseUrl.get()}/media/catalog/product${entry.file}`,
        };
      }),
    };
  });

  return { products: { items } };
}

export const setCartCookie = (headers: Headers, cartId: string) => {
  setCookie(headers, {
    name: CART_COOKIE,
    value: cartId,
    path: "/",
    httpOnly: false,
    secure: false,
  });
};

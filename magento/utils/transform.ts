import { Offer, Product } from "../../commerce/types.ts";
import { MagentoProduct } from "./client/types.ts";
import { IN_STOCK, OUT_OF_STOCK } from "./constants.ts";

export const parseSlug = (slug: string) => {
  const segments = slug.split("-");
  const id = Number(segments.at(-1));

  if (!id) {
    throw new Error("Malformed slug. Expecting {slug}-{id} format");
  }

  return {
    slug: segments.slice(0, -1).join("-"),
    id: Number(segments.at(-1)),
  };
};

export const toProduct = (
  product: MagentoProduct,
): Product => {
  const offers = toOffer(product);
  const sku = product.sku;
  const productID = product.id.toString();
  const productPrice = product.price_info

  return {
    "@type": "Product",
    productID,
    sku,
    url: product.url,
    name: product.name,
    additionalProperty: product.custom_attributes?.map((attr) => ({
      "@type": "PropertyValue",
      name: attr.attribute_code,
      value: String(attr.value),
    })),
    image: product.images?.map((img) => ({
      "@type": "ImageObject" as const,
      encodingFormat: "image",
      alternateName: `${img.url}`,
      url: img.url,
    })),
    offers: {
      "@type": "AggregateOffer",
      highPrice: productPrice?.max_price ?? product.price!,
      lowPrice: productPrice?.minimal_price ?? product.price!,
      offerCount: offers.length,
      offers: offers,
    },
  };
};

export const toOffer = (
  { price_info, extension_attributes, sku, currency_code }: MagentoProduct,
): Offer[] => {
  if (!price_info) {
    return [];
  }
  const { final_price } = price_info;
  const { stock_item } = extension_attributes;

  const offer: Offer = {
    "@type": "Offer",
    availability: stock_item?.is_in_stock ? IN_STOCK : OUT_OF_STOCK,
    inventoryLevel: {
      value: stock_item?.qty ?? 0,
    },
    itemCondition: "https://schema.org/NewCondition",
    price: final_price,
    priceCurrency: currency_code,
    priceSpecification: [],
    sku: sku,
  };
  return [offer];
};

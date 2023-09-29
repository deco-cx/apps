import type { Product } from "../../commerce/types.ts";
import { DEFAULT_IMAGE } from "../../commerce/utils/constants.ts";
import { Beer } from "../api-typings.d.ts";

export const toProduct = (
  beer: Beer,
  url: URL,
): Product => {
  return {} as unknown as Product;
};

// return {
//   "@type": "Product",
//   productID,
//   url: `${url.origin}${getPath(product, sku)}`,
//   name: sku.title,
//   description,
//   sku: productID,
//   gtin: barcode ?? undefined,
//   brand: { "@type": "Brand", name: vendor },
//   releaseDate: createdAt,
//   additionalProperty,
//   isVariantOf: {
//     "@type": "ProductGroup",
//     productGroupID,
//     hasVariant: hasVariant || [],
//     url: `${url.host}${getPath(product)}`,
//     name: product.title,
//     additionalProperty: [],
//     image: nonEmptyArray(images.nodes)?.map((img) => ({
//       "@type": "ImageObject",
//       alternateName: img.altText ?? "",
//       url: img.url,
//     })),
//   },
//   image: skuImages?.map((img) => ({
//     "@type": "ImageObject",
//     alternateName: img?.altText ?? "",
//     url: img?.url,
//   })) ?? [DEFAULT_IMAGE],
//   offers: {
//     "@type": "AggregateOffer",
//     priceCurrency: price.currencyCode,
//     highPrice: compareAtPrice
//       ? Number(compareAtPrice.amount)
//       : Number(price.amount),
//     lowPrice: Number(price.amount),
//     offerCount: 1,
//     offers: [{
//       "@type": "Offer",
//       price: Number(price.amount),
//       availability: availableForSale
//         ? "https://schema.org/InStock"
//         : "https://schema.org/OutOfStock",
//       inventoryLevel: { value: quantityAvailable ?? 0 },
//       priceSpecification: priceSpec,
//     }],
//   },
// };

import type { ProductDTO } from "../utils/openapi/api.openapi.gen.ts";
import type {
  ImageObject,
  ItemAvailability,
  Product,
} from "../../commerce/types.ts";

const productAvailability = {
  AVAILABLE: "https://schema.org/InStock",
  RESERVE: "https://schema.org/PreOrder",
  UNAVAILABLE: "https://schema.org/OutOfStock",
} as Record<string, ItemAvailability>;

export const toProduct = (p: ProductDTO): Product => {
  return {
    "@type": "Product",
    productID: p.id?.toString() ?? "",
    sku: p.codes?.sku ?? "",
    name: p.language?.name,
    description: p.language?.longDescription,
    image: [
      {
        "@type": "ImageObject",
        url: p.mainImages?.largeImage ?? p.mainImages?.mediumImage ??
          p.mainImages?.smallImage,
      },
      ...(p.additionalImages ?? []).map(
        ({ smallImage, largeImage }) =>
          ({
            "@type": "ImageObject",
            url: largeImage ?? smallImage,
          }) as ImageObject,
      ),
    ],
    url: p.language?.urlSeo,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      highPrice: p.prices?.prices?.retailPrice ?? 0,
      lowPrice: p.prices?.prices?.basePrice ?? 0,
      offerCount: 1,
      offers: [
        {
          "@type": "Offer",
          price: p.prices?.prices?.basePrice ?? 0,
          priceCurrency: "BRL",
          availability:
            productAvailability[p.combinationData?.status ?? "UNAVAILABLE"],
          inventoryLevel: { value: p.combinationData?.stock?.units ?? 0 },
          priceSpecification: [],
        },
      ],
    },
  };
};

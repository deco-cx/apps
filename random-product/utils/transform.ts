import type { Product } from "../../commerce/types.ts";
import { DEFAULT_IMAGE } from "../../commerce/utils/constants.ts";
import { Beer } from "../api-typings.d.ts";

export const toProduct = (
  beer: Beer,
  url: URL,
): Product => {
  console.log({ beer });
  return {
    "@type": "Product",
    productID: "my-test-id",
    url: `${url.origin}/beers/${beer.uid}`,
    name: beer.name,
    description: beer.style,
    sku: `${beer.id}`,
    brand: { "@type": "Brand", name: beer.brand },
    // releaseDate: createdAt,
    additionalProperty: [{
      "@type": "PropertyValue",
      name: "hop",
      value: beer.hop,
    }],
    image: [DEFAULT_IMAGE],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      highPrice: 100,
      lowPrice: 100,
      offerCount: 1,
      offers: [{
        "@type": "Offer",
        price: 100,
        availability: "https://schema.org/InStock",
        inventoryLevel: { value: 10 },
        priceSpecification: [{
          "@type": "UnitPriceSpecification",
          priceType: "https://schema.org/SalePrice",
          price: 100,
        }],
      }],
    },
  };
};

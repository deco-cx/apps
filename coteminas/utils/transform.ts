import type {
    BreadcrumbList,
    Filter,
    FilterToggleValue,
    Navbar,
    Offer,
    Product,
    ProductDetailsPage,
    ProductGroup,
    PropertyValue,
    UnitPriceSpecification,
  } from "../../commerce/types.ts";

import { ProductCard } from "./types.ts";

const toUrlImage = (path: string) => {
  const origin = "https://images-prod.mmartan.com.br/1536x1536"
  if(path.endsWith("png")) return `${origin}/png${path}`

  return `${origin}/jpg${path}`
}

export const toProduct = (inputObject : ProductCard, url: URL) : Product => {
  const schemaProduct : Product = {
    "@type": "Product",
    productID: inputObject.sku,
    url: url.origin + inputObject.url,
    name: inputObject.title,
    sku: inputObject.sku,
    description: inputObject.title,
    brand: {
      "@type": "Brand",
      name: inputObject.brand
    },
    category: inputObject.category,
    image: [
      {
        "@type": "ImageObject",
          alternateName: inputObject.title,
          url: toUrlImage(inputObject.image),
      },
      {
        "@type": "ImageObject",
          alternateName: inputObject.title,
          url: toUrlImage(inputObject.hoverImage),
      }
    ],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL", // Se sua moeda for diferente, atualize isso
      highPrice: inputObject.price.max,
      lowPrice: inputObject.price.min,
      offerCount: 1,
      offers:[
        {
          "@type": "Offer",
          seller: "Coteminas",
          availability: inputObject.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          price: inputObject.price.min,
          inventoryLevel: {
            value: 1000
          },
          priceSpecification: [{
            "@type": "UnitPriceSpecification",
            priceType: "https://schema.org/SalePrice",
            price: inputObject.price.max,
          }]
        }
      ]

    }
  };

  return schemaProduct;
}
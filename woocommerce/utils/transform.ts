import { BreadcrumbList, ImageObject, Product } from "../../commerce/types.ts";
import { BaseProduct, WCImage } from "./types.ts";

export const toProduct = (
  product: BaseProduct,
): Product => {
  return {
    "@type": "Product",
    "@id": String(product.id),
    productID: String(product.id),
    sku: product.sku,
    name: product.name,
    url: product.slug,
    description: product.description,
    image: toImage(product.images),
    offers: {
      "@type": "AggregateOffer",
      highPrice: Number(product.regular_price || product.price),
      lowPrice: Number(product.sale_price),
      offerCount: 0,
      offers: [],
    },
    additionalProperty: product.categories.map((category) => ({
      "@type": "PropertyValue",
      name: category.name,
      url: category.slug,
    })),
  };
};

export const toBreadcrumbList = (
  categories: BaseProduct["categories"],
): BreadcrumbList => {
  return {
    "@type": "BreadcrumbList" as const,
    numberOfItems: categories.length,
    itemListElement: categories.map((category, index) => ({
      "@type": "ListItem" as const,
      name: category.name,
      position: index + 1,
      item: new URL(category.slug).href,
    })),
  };
};

export const toImage = (
  images: WCImage[],
): ImageObject[] => {
  return images.map((image) => ({
    "@type": "ImageObject",
    alternateName: image.alt,
    url: image.src,
    contentUrl: image.src,
    description: image.alt,
  }));
};

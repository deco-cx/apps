import type { AppContext } from "../mod.ts";

import {
  Offer,
  Product,
  ProductDetailsPage,
  UnitPriceSpecification,
} from "../../commerce/types.ts";

import { ProductItemGrid } from "./client.ts";

interface ProductOptions {
  url: URL;
  priceCurrency: string;
}

const toURL = (src: string) => src.startsWith("//") ? `https:${src}` : src;

const toOffer = (product: ProductItemGrid): Offer => {
  const priceSpecification: UnitPriceSpecification[] = [
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/ListPrice",
      price: product.Price?.ListPrice,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      price: product.Price?.SalesPrice,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      name: product.Price?.MaxInstallmentsNoInterest?.PaymentType,
      description: product.Price?.MaxInstallmentsNoInterest?.PaymentType,
      billingDuration: product.Price?.MaxInstallmentsNoInterest
        ?.Installments,
      billingIncrement: product.Price?.MaxInstallmentsNoInterest
        ?.InstallmentPrice,
      price: product.Price?.MaxInstallmentsNoInterest?.RetailPrice,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      name: product.Price?.BestInstallment?.PaymentType,
      description: product.Price?.BestInstallment?.PaymentType,
      billingDuration: product.Price?.BestInstallment
        ?.Installments,
      billingIncrement: product.Price?.MaxInstallmentsNoInterest
        ?.InstallmentPrice,
      price: product.Price?.MaxInstallmentsNoInterest?.RetailPrice,
    },
  ];

  return {
    "@type": "Offer",
    seller: product?.Price?.BuyBox?.SellerName,
    priceValidUntil: product?.PromotionTo,
    price: product.Price?.SalesPrice,
    priceSpecification: priceSpecification,
    inventoryLevel: {
      value: 0,
    },
    availability: product.Availability != "D"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  };
};

export const toProduct = (
  ctx: AppContext,
  product: ProductItemGrid,
  options: ProductOptions,
): Product => {
  const { priceCurrency } = options;
  const offersList = toOffer(product);
  const offers = offersList ? [offersList] : [];

  return {
    "@type": "Product",
    productID: product.ProductID,
    sku: product.SKU,
    url: ctx.publicUrl + product.Url,
    name: product.Name,
    description:
      product.Descriptions?.filter((description) =>
        description.Alias === "LongDescription"
      )[0].Value,
    gtin: product.ProductID,
    image: product.MediaGroups?.map((
      img,
    ) => ({
      "@type": "ImageObject" as const,
      alternateName: product.Name,
      url: toURL(ctx.cdnUrl + img.Zoom?.MediaPath),
    })),
    offers: {
      "@type": "AggregateOffer" as const,
      priceCurrency: priceCurrency,
      lowPrice: product.Price?.ListPrice,
      highPrice: product.Price?.SalesPrice,
      offerCount: 1,
      offers: offers,
    },
  };
};

export const toProductDetails = (
  ctx: AppContext,
  product: ProductItemGrid,
  options: ProductOptions,
): ProductDetailsPage => {
  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    product: toProduct(ctx, product, options),
  };
};

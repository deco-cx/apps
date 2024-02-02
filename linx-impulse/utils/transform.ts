import type {
  Offer,
  Person,
  Product,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import type { LinxUser } from "./types/analytics.ts";
import type { Product as LinxProduct, Sku } from "./types/linx.ts";
import { Query } from "./types/search.ts";

const toOffer = (variant: Sku): Offer => {
  const { properties } = variant;

  const priceSpecification: UnitPriceSpecification[] = [
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/ListPrice",
      price: properties.oldPrice ?? Infinity,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      price: properties.price ?? Infinity,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      billingDuration: properties.installment.count,
      billingIncrement: properties.installment.price,
      price: properties.installment.price * properties.installment.count,
    },
  ];

  return {
    "@type": "Offer",
    seller: undefined,
    priceValidUntil: undefined,
    price: properties.price ?? properties.oldPrice ?? Infinity,
    priceSpecification,
    inventoryLevel: {},
    availability: properties.status.toLowerCase() === "available"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  };
};

const pickVariant = (variants: Sku[], variantId: string | null) => {
  if (variantId === null) {
    return variants[0];
  }

  for (const variant of variants) {
    if (variant.sku === variantId) {
      return variant;
    }
  }

  return variants[0];
};

const sanitizeValue = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" || typeof value === "bigint" ||
    typeof value === "boolean"
  ) {
    return `${value}`;
  }

  return JSON.stringify(value);
};

/**
 * @description Adds protocol to URL if missing
 * @param url
 * @returns {string}
 */
const fixURL = (url: string): string =>
  url.startsWith("http")
    ? url
    : url.startsWith("//")
    ? `https:${url}`
    : `https://${url}`;

const toProductUrl = (url: string, origin: string, sku?: string): string => {
  const productURL = new URL(fixURL(url));
  productURL.searchParams.delete("v");

  if (sku) {
    productURL.searchParams.set("v", sku);
  }

  return `${origin}${productURL.pathname}${productURL.search}`;
};

export const toProduct = (
  product: LinxProduct,
  variantId: string | null,
  origin: string,
  level = 0,
): Product => {
  const variants = product.skus ?? [];
  const variant = pickVariant(product.skus, variantId);

  const offer = toOffer(variant);
  const offers = offer ? [offer] : [];

  const additionalProperty =
    Object.entries(variant.properties.details ?? {})?.map(([key, value]) => ({
      "@type": "PropertyValue" as const,
      name: key,
      value: sanitizeValue(value),
    })) ?? [];

  const hasVariant = level < 1
    ? variants.map((variant) => toProduct(product, variant.sku, origin, 1))
    : [];

  const toImage = (url: string) => ({
    "@type": "ImageObject" as const,
    alternateName: product.name,
    url: fixURL(url),
  });

  const image = Object.values(product.images ?? {}).map(toImage) ?? [];

  const trackingId = new URLSearchParams(product.clickUrl).get("trackingId");

  return {
    "@type": "Product",
    productID: `${product.id}`,
    sku: `${variant.sku}`,
    url: toProductUrl(product.url, origin, variant.sku),
    category: product.categories.map((c) => c.name).join(">"),
    name: variant.properties.name,
    gtin: undefined,
    brand: {
      "@type": "Brand",
      "@id": `${product.brand}`,
      name: product.brand ?? undefined,
      logo: undefined,
    },
    additionalProperty,
    image,
    isVariantOf: {
      "@type": "ProductGroup",
      url: toProductUrl(product.url, origin),
      name: product.name,
      description: product.description,
      image,
      productGroupID: product.id,
      additionalProperty: [
        ...Object
          .entries(product.specs)
          .flatMap((
            [key, value],
          ) =>
            value.map((spec) => ({
              "@type": "PropertyValue" as const,
              name: key,
              value: sanitizeValue(spec.label),
            }))
          ),
        ...Object
          .entries(product.details)
          .map(([key, value]) => ({
            "@type": "PropertyValue" as const,
            name: key,
            value: sanitizeValue(value[0]),
          })),
        {
          "@type": "PropertyValue" as const,
          name: "trackingId",
          value: trackingId ?? undefined,
        },
      ],
      hasVariant,
    },
    offers: {
      "@type": "AggregateOffer" as const,
      priceCurrency: "BRL",
      lowPrice: variant.properties.price ?? variant.properties.oldPrice ??
        Infinity,
      highPrice: variant.properties.price ?? variant.properties.oldPrice ??
        Infinity,
      offerCount: offers.length,
      offers,
    },
  };
};

export const toUser = (user: Person): LinxUser => ({
  id: user["@id"] ?? "",
  email: user.email ?? "",
  allowMailMarketing: false, // TODO: get from user
  name: user.name,
  birthday: undefined, // TODO: get from user
  gender: user.gender === "https://schema.org/Male" ? "M" : "F",
});

export const toSearch = ({ query, link }: Query) => ({
  term: query,
  href: link,
});

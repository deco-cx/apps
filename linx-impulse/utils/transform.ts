import type {
  Filter,
  Offer,
  Person,
  Product,
  ProductListingPage,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import { FilterToggleValue } from "../../commerce/types.ts";
import type { LinxUser } from "./types/analytics.ts";
import type {
  Filter as LinxFilter,
  Product as LinxProduct,
  Sku,
} from "./types/linx.ts";
import { DiscreteValue, SortBy } from "./types/linx.ts";
import type { Query } from "./types/search.ts";
import { HotsiteResponse } from "./types/search.ts";
import { SearchResponse } from "./types/search.ts";
import { NavigateResponse } from "./types/search.ts";

const toOffer = (variant: Sku): Offer => {
  const {
    oldPrice = variant.properties?.oldPrice ?? 0,
    price = variant.properties?.price ?? 0,
    installment = variant.properties?.installment ?? { count: 0, price: 0 },
    status = variant.properties?.status ?? "unavailable",
  } = variant;

  const priceSpecification: UnitPriceSpecification[] = [
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/ListPrice",
      price: oldPrice,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      price,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      billingDuration: installment.count,
      billingIncrement: installment.price,
      price: installment.price * installment.count,
    },
  ];

  return {
    "@type": "Offer",
    seller: undefined,
    priceValidUntil: undefined,
    price: price ?? oldPrice,
    priceSpecification,
    inventoryLevel: {},
    availability: status.toLowerCase() === "available"
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
  productURL.pathname += "/p";

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
    Object.entries(variant.properties?.details ?? {})?.map(([key, value]) => ({
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
    name: variant.properties?.name,
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
          .entries(product.specs ?? {})
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
      lowPrice: variant.price ?? variant.properties?.price ??
        variant.properties?.oldPrice ?? 0,
      highPrice: variant.oldPrice ?? variant.properties?.oldPrice ??
        variant.properties?.price ?? 0,
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

const toFilterValue = (
  filter: DiscreteValue,
  parent: LinxFilter,
  url: URL,
): FilterToggleValue => {
  const _url = new URL(url.toString());
  _url.searchParams.delete("page");

  const value = `d:${filter.id}:${filter.id}`;
  const selected = _url.searchParams.has("filter", value);
  const hasChildren = filter.filters && filter.filters.length > 0;

  if (selected) {
    _url.searchParams.delete("filter", value);
  } else {
    _url.searchParams.append("filter", value);
  }

  return {
    label: filter.label,
    selected,
    url: _url.pathname + _url.search,
    quantity: filter.size,
    value: `d:${parent.id}:${filter.id}`,
    ...(hasChildren && {
      children: {
        "@type": "FilterToggle",
        label: filter.label,
        key: `${filter.id}`,
        quantity: filter.size,
        values: filter.filters!.map((f) => toFilterValue(f, parent, url)),
      },
    }),
  };
};

export const toFilter = (
  filter: LinxFilter,
  url: URL,
): Filter => {
  if (filter.type === "discrete") {
    const quantity = filter.values.reduce((acc, f) => acc + f.size, 0);

    return {
      "@type": "FilterToggle",
      label: filter.attribute,
      key: `${filter.id}`,
      quantity,
      values: filter.values.map((f) => toFilterValue(f, filter, url)),
    };
  }

  return {
    "@type": "FilterRange",
    label: filter.attribute,
    key: `${filter.id}`,
    values: {
      min: filter.values[0].min.value,
      max: filter.values[0].max.value,
    },
  };
};

const generatePages = (page: number, url: string) => {
  const _url = new URL(url);
  _url.searchParams.set("page", (page + 1).toString());
  const nextPage = _url.pathname + _url.search;
  _url.searchParams.set("page", (page - 1).toString());
  const previousPage = page > 1 ? _url.pathname + _url.search : undefined;
  return { nextPage, previousPage };
};

export const sortOptions: { value: SortBy; label: string }[] = [
  { value: "relevance", label: "Relevância" },
  { value: "pid", label: "Id de produto" },
  { value: "ascPrice", label: "Menor preço" },
  { value: "descPrice", label: "Maior preço" },
  { value: "descDate", label: "Lançamento" },
  { value: "ascSold", label: "Menor venda" },
  { value: "descSold", label: "Maior venda" },
  { value: "ascReview", label: "Menor avaliação" },
  { value: "descReview", label: "Maior avaliação" },
  { value: "descDiscount", label: "Maiores descontos" },
];

export const toProductListingPage = (
  response: NavigateResponse | SearchResponse | HotsiteResponse,
  page: number,
  resultsPerPage: number,
  url: string,
): ProductListingPage => {
  const { nextPage, previousPage } = generatePages(page, url);

  return {
    "@type": "ProductListingPage",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    sortOptions,
    products: response.products.map((p) =>
      toProduct(p, p.selectedSku ?? null, new URL(url).origin)
    ),
    pageInfo: {
      currentPage: page,
      nextPage,
      previousPage,
      records: response.size,
      recordPerPage: resultsPerPage,
    },
    filters: response.filters.map((f) => toFilter(f, new URL(url))),
  };
};

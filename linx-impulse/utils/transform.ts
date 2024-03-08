import type {
  Filter,
  Offer,
  Person,
  Product,
  ProductListingPage,
  PropertyValue,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import {
  Brand,
  FilterToggleValue,
  ProductGroup,
  Search,
} from "../../commerce/types.ts";
import type { LinxUser } from "./types/analytics.ts";
import type { ChaordicProduct } from "./types/chaordic.ts";
import type { ImpulseProduct, ImpulseSku } from "./types/impulse.ts";
import type {
  DiscreteValue,
  Filter as LinxFilter,
  Product as LinxProduct,
  Sku,
  SortBy,
} from "./types/linx.ts";
import type {
  HotsiteResponse,
  NavigateResponse,
  Query,
  SearchResponse,
} from "./types/search.ts";

const isImpulseProduct = (product: LinxProduct): product is ImpulseProduct => {
  return "clickUrl" in product || "collectInfo" in product;
};
const isImpulseSku = (sku: Sku): sku is ImpulseSku => {
  return "properties" in sku && !("status" in sku);
};

const toOffer = (variant: Sku): Offer => {
  const {
    oldPrice = 0,
    price = 0,
    installment = { count: 0, price: 0 },
    status = "unavailable",
    stock = 0,
  } = isImpulseSku(variant) ? variant.properties : variant;

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
    seller: "Linx Impulse",
    price: price ?? oldPrice,
    priceSpecification,
    inventoryLevel: {
      value: stock,
    },
    availability: status.toLowerCase() === "available"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  };
};

const pickVariant = <T extends Sku>(variants: T[], variantId?: string): T => {
  if (!variantId) {
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

  if (Array.isArray(value)) {
    return sanitizeValue(value[0]);
  }

  return JSON.stringify(value);
};

/**
 * @description Handle URL from linx
 * @param url
 * @returns {string}
 */
const fixURL = (url: string, cdn?: string): string =>
  url.startsWith("http")
    ? url
    : url.startsWith("//")
    ? `https:${url}`
    : cdn
    ? `${cdn}${url.startsWith("/") ? url : `/${url}`}`
    : `https://${url}`;

const toProductUrl = (
  url: string,
  origin: string,
  sku?: string,
  cdn?: string,
): string => {
  const productURL = new URL(fixURL(url, cdn));
  productURL.searchParams.delete("v");

  if (!productURL.pathname.endsWith("/p")) {
    productURL.pathname += "/p";
  }

  if (sku) {
    productURL.searchParams.set("skuId", sku);
  }

  return `${origin}${productURL.pathname}${productURL.search}`;
};

const toPropertyValue = (
  value: Partial<Omit<PropertyValue, "@type">>,
): PropertyValue => ({
  "@type": "PropertyValue",
  ...value,
});

const productFromImpulse = (
  product: ImpulseProduct,
  origin: string,
  variantId?: string,
  cdn?: string,
  level = 0,
): Product => {
  const variants = product.skus ?? [];
  const variant = pickVariant(product.skus, variantId ?? product.selectedSku);
  const trackingId = new URLSearchParams(product.clickUrl).get("trackingId");
  const brandName = product.brand ?? sanitizeValue(product.details["brand"]);
  const brand = brandName
    ? {
      "@type": "Brand",
      name: brandName,
    } satisfies Brand
    : undefined;

  const offer = toOffer(variant);
  const offers = offer ? [offer] : [];

  const isVariantOfAdditionalProperty = [
    ...Object
      .entries(product.specs ?? {})
      .flatMap((
        [key, value],
      ) =>
        value.map((spec) =>
          toPropertyValue({
            name: key,
            value: sanitizeValue(spec.label),
            propertyID: spec.id,
          })
        )
      ),
    ...Object
      .entries(product.details)
      .map(([key, value]) =>
        toPropertyValue({ name: key, value: sanitizeValue(value[0]) })
      ),
    toPropertyValue({
      name: "trackingId",
      value: trackingId ?? undefined,
    }),
  ];
  const additionalProperty: PropertyValue[] = [
    ...Object.entries(variant.properties?.details ?? {})?.map((
      [key, value],
    ) => toPropertyValue({ name: key, value: sanitizeValue(value) })),
    ...product.categories.map((c) =>
      toPropertyValue({
        name: "category",
        value: c.name,
        propertyID: c.id,
      })
    ),
    ...(level >= 1 ? isVariantOfAdditionalProperty : [toPropertyValue({
      name: "trackingId",
      value: trackingId ?? undefined,
    })]),
  ];

  const hasVariant = level < 1
    ? variants.map((variant) =>
      productFromImpulse(product, origin, variant.sku, cdn, 1)
    )
    : [];

  const toImage = (url: string) => ({
    "@type": "ImageObject" as const,
    alternateName: product.name,
    url: fixURL(url, cdn),
  });

  const image = Object.values(product.images ?? {}).map(toImage) ?? [];
  const isVariantOf = level < 1
    ? {
      "@type": "ProductGroup",
      url: toProductUrl(product.url, origin),
      name: product.name,
      description: product.description,
      image,
      productGroupID: product.id,
      additionalProperty: isVariantOfAdditionalProperty,
      hasVariant,
    } satisfies ProductGroup
    : undefined;

  return {
    "@type": "Product",
    productID: `${variant.sku}`,
    sku: `${variant.sku}`,
    url: toProductUrl(product.url, origin, variant.sku),
    category: product.categories.map((c) => c.name).join(">"),
    name: variant.properties?.name ?? product.name,
    brand,
    additionalProperty,
    image,
    isVariantOf,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      lowPrice: variant.properties?.price ?? variant.properties?.oldPrice ??
        0,
      highPrice: variant.properties?.oldPrice ?? variant.properties?.price ??
        0,
      offerCount: offers.length,
      offers,
    },
  };
};

const productFromChaordic = (
  product: ChaordicProduct,
  origin: string,
  variantId?: string,
  cdn?: string,
  level = 0,
): Product => {
  const variants = product.skus ?? [];
  const variant = pickVariant(product.skus, variantId);
  const trackingId = new URL(product.trackingUrl).searchParams.get(
    "trackingId",
  );
  const brandName = product.brand ?? sanitizeValue(product.details["brand"]);
  const brand = brandName
    ? {
      "@type": "Brand",
      name: brandName,
    } satisfies Brand
    : undefined;

  const offer = toOffer(variant);
  const offers = offer ? [offer] : [];

  const isVariantOfAdditionalProperty = [
    ...Object
      .entries(variant.specs ?? {})
      .flatMap((
        [key, value],
      ) => {
        if (Array.isArray(value)) {
          return value.map((spec) =>
            toPropertyValue({
              name: key,
              value: sanitizeValue(spec),
            })
          );
        }
        return toPropertyValue({ name: key, value: sanitizeValue(value) });
      }),
    ...Object
      .entries(product.details)
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((spec) =>
            toPropertyValue({
              name: key,
              value: sanitizeValue(spec),
            })
          );
        }
        return toPropertyValue({ name: key, value: sanitizeValue(value) });
      }),
    toPropertyValue({
      name: "trackingId",
      value: trackingId ?? undefined,
    }),
  ];
  const additionalProperty: PropertyValue[] = [
    ...Object.entries(variant?.details ?? {})?.map(([key, value]) =>
      toPropertyValue({ name: key, value: sanitizeValue(value) })
    ),
    ...(level >= 1 ? isVariantOfAdditionalProperty : [toPropertyValue({
      name: "trackingId",
      value: trackingId ?? undefined,
    })]),
  ];

  const hasVariant = level < 1
    ? variants.map((variant) =>
      productFromChaordic(product, origin, variant.sku, cdn, 1)
    )
    : [];

  const toImage = (url: string) => ({
    "@type": "ImageObject" as const,
    alternateName: product.name,
    url: fixURL(url, cdn),
  });

  const image = Object.values(product.images ?? {}).map(toImage) ?? [];
  const isVariantOf = level < 1
    ? {
      "@type": "ProductGroup",
      url: toProductUrl(product.url, origin),
      name: product.name,
      image,
      productGroupID: product.id,
      additionalProperty: isVariantOfAdditionalProperty,
      hasVariant,
    } satisfies ProductGroup
    : undefined;

  return {
    "@type": "Product",
    productID: `${variant.sku}`,
    sku: `${variant.sku}`,
    url: toProductUrl(product.url, origin, variant.sku),
    category: product.categories.map((c) => c.name).join(">"),
    name: variant?.name ?? product.name,
    brand,
    additionalProperty,
    image,
    isVariantOf,
    offers: {
      "@type": "AggregateOffer" as const,
      priceCurrency: "BRL",
      lowPrice: variant.price ?? variant.oldPrice ?? 0,
      highPrice: variant.oldPrice ?? variant.price ?? 0,
      offerCount: offers.length,
      offers,
    },
  };
};

export const toProduct = (
  product: LinxProduct,
  origin: string,
  cdn?: string,
  level = 0,
): Product => {
  const isImpulse = isImpulseProduct(product);
  if (isImpulse) {
    return productFromImpulse(product, origin, product.selectedSku, cdn, level);
  }

  return productFromChaordic(product, origin, undefined, cdn, level);
};

export const toUser = (user: Person): LinxUser => ({
  id: user["@id"] ?? "",
  email: user.email ?? "",
  allowMailMarketing: false, // TODO: get from user
  name: user.name,
  birthday: undefined, // TODO: get from user
  gender: user.gender === "https://schema.org/Male" ? "M" : "F",
});

export const toSearch = (
  { query, link, category, categoryId }: Query,
): Search => ({
  term: query,
  href: link,
  facets: [{
    key: category ?? "category",
    values: [categoryId ?? "categoryId"],
  }],
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
  cdn?: string,
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
      toProduct(p, new URL(url).origin, cdn)
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

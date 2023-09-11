import {
  BreadcrumbList,
  ListItem,
  Product,
  ProductListingPage,
  PropertyValue,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import { DEFAULT_IMAGE } from "../../commerce/utils/constants.ts";
import {
  ProductFragment,
  SearchQuery,
  SingleProductFragment,
} from "./graphql/graphql.gen.ts";

export const stale = {
  deco: { cache: "stale-while-revalidate" },
};

export const FILTER_PARAM = "filtro";

export const camposAdicionais = [
  "Atacado",
  "Estoque",
  "Atributo",
  "Informacao",
  "TabelaPreco",
];

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

export const getProductUrl = (
  { alias }: ProductFragment | SingleProductFragment,
  base: URL | string,
) => new URL(`/produto/${alias}`, base);

export const getVariantUrl = (
  variant: ProductFragment | SingleProductFragment,
  base: URL | string,
) => {
  const url = getProductUrl(variant, base);

  url.searchParams.set("skuId", variant.productVariantId);

  return url;
};

export const toFilters = (
  aggregations: NonNullable<SearchQuery["search"]>["aggregations"],
  { base }: { base: URL },
): ProductListingPage["filters"] =>
  aggregations?.filters?.map((filter) => ({
    "@type": "FilterToggle",
    key: filter?.origin ?? "",
    label: filter?.field ?? "",
    quantity: 0,
    values: filter?.values?.map((filterValue) => {
      const url = new URL(base);
      const { name, quantity } = filterValue!;
      const index = url.searchParams
        .getAll(FILTER_PARAM)
        .findIndex((f) => f === name);
      const selected = index > -1;

      if (selected) {
        const params = new URLSearchParams();
        url.searchParams.forEach((value, key) => {
          if (key !== FILTER_PARAM || !value.endsWith(name!)) {
            params.append(key, value);
          }
        });
        url.search = `${params}`;
      } else {
        url.searchParams.append(FILTER_PARAM, `${filter.field}:${name}`);
      }

      return {
        value: name!,
        label: name!,
        quantity: quantity!,
        selected,
        url: url.href,
      };
    }) ?? [],
  })) ?? [];

export const toBreadcrumbList = (
  product: Product,
  categories: ProductFragment["productCategories"],
  { base }: { base: URL },
): BreadcrumbList => {
  const category = categories?.find((c) => c?.main);
  const segments = category?.url?.split("/") ?? [];
  const names = category?.hierarchy?.split(" > ") ?? [];
  const itemListElement = segments.length === names.length
    ? [
      ...segments.map((_, i): ListItem<string> => ({
        "@type": "ListItem",
        name: names[i],
        position: i + 1,
        item: new URL(`/${segments.slice(0, i + 1).join("/")}`, base).href,
      })),
      {
        "@type": "ListItem",
        name: product.isVariantOf?.name,
        url: product.isVariantOf?.url,
        position: segments.length + 1,
      } as ListItem<string>,
    ]
    : [];

  return {
    "@type": "BreadcrumbList",
    numberOfItems: itemListElement.length,
    itemListElement,
  };
};

export const toProduct = (
  variant: ProductFragment | SingleProductFragment,
  { base }: { base: URL | string },
): Product => {
  const images = variant.images?.map((image) => ({
    "@type": "ImageObject" as const,
    url: image?.url ?? "",
    alternateName: image?.fileName ?? "",
  }));
  const additionalProperty: PropertyValue[] = [];
  variant.informations?.forEach((info) =>
    additionalProperty.push({
      "@type": "PropertyValue",
      name: info?.title ?? undefined,
      value: info?.value ?? undefined,
      valueReference: "INFORMATION",
    })
  );
  variant.attributes?.forEach((attr) =>
    additionalProperty.push({
      "@type": "PropertyValue",
      name: attr?.name ?? undefined,
      value: attr?.value ?? undefined,
      valueReference: "SPECIFICATION",
    })
  );

  const priceSpecification: UnitPriceSpecification[] = [];
  if (variant.prices?.listPrice) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/ListPrice",
      price: variant.prices.listPrice,
    });
  }
  if (variant.prices?.price) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      price: variant.prices.price,
    });
  }

  return {
    "@type": "Product",
    url: getVariantUrl(variant, base).href,
    gtin: variant.ean ?? undefined,
    sku: variant.sku!,
    description:
      variant.informations?.find((info) => info?.type === "Descrição")?.value ??
        undefined,
    productID: variant.productVariantId,
    name: variant.variantName ?? undefined,
    inProductGroupWithID: variant.productId,
    image: !images?.length ? [DEFAULT_IMAGE] : images,
    brand: {
      "@type": "Brand",
      name: variant.productBrand?.name ?? "",
      url: variant.productBrand?.logoUrl ?? variant.productBrand?.fullUrlLogo ??
        "",
    },
    isSimilarTo: [],
    isVariantOf: {
      "@type": "ProductGroup",
      url: getProductUrl(variant, base).href,
      name: variant.productName ?? undefined,
      productGroupID: variant.productId,
      hasVariant: [],
      additionalProperty: [],
    },
    additionalProperty,
    offers: {
      "@type": "AggregateOffer",
      highPrice: variant.prices?.price,
      lowPrice: variant.prices?.price,
      offerCount: 1,
      offers: [{
        "@type": "Offer",
        seller: variant.seller?.name ?? undefined,
        price: variant.prices?.price,
        priceSpecification,
        availability: variant.available
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        inventoryLevel: { value: variant.stock },
      }],
    },
  };
};

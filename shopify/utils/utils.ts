import {
  InputMaybe,
  ProductCollectionSortKeys,
  ProductFilter,
  SearchSortKeys as SearchSortKeysShopify,
} from "../utils/storefront/storefront.graphql.gen.ts";

export const sortOptions = [
  { value: "", label: "relevance:desc" },
  { value: "price-ascending", label: "price:asc" },
  { value: "price-descending", label: "price:desc" },
  { value: "best-selling", label: "orders:desc" },
  { value: "title-ascending", label: "name:asc" },
  { value: "title-descending", label: "name:desc" },
  { value: "created-descending", label: "release:desc" },
];

// only these sorts work for search at shopify
export const searchSortOptions = [
  { value: "", label: "relevance:desc" },
  { value: "price-ascending", label: "price:asc" },
  { value: "price-descending", label: "price:desc" },
];

export type CollectionSortKeys =
  | ""
  | "price-descending"
  | "price-ascending"
  | "best-selling"
  | "title-descending"
  | "title-ascending"
  | "created-descending";

export type SearchSortKeys =
  | ""
  | "price-descending"
  | "price-ascending";

export const searchSortShopify: Record<
  string,
  { sortKey: SearchSortKeysShopify; reverse: boolean }
> = {
  "": {
    sortKey: "RELEVANCE",
    reverse: false,
  },
  "price-descending": {
    sortKey: "PRICE",
    reverse: true,
  },
  "price-ascending": {
    sortKey: "PRICE",
    reverse: false,
  },
};

export const sortShopify: Record<
  string,
  {
    sortKey: ProductCollectionSortKeys | SearchSortKeysShopify;
    reverse: boolean;
  }
> = {
  "": {
    sortKey: "RELEVANCE",
    reverse: false,
  },
  "price-descending": {
    sortKey: "PRICE",
    reverse: true,
  },
  "price-ascending": {
    sortKey: "PRICE",
    reverse: false,
  },
  "best-selling": {
    sortKey: "BEST_SELLING",
    reverse: false,
  },
  "title-descending": {
    sortKey: "TITLE",
    reverse: true,
  },
  "title-ascending": {
    sortKey: "TITLE",
    reverse: false,
  },
  "created-descending": {
    sortKey: "CREATED",
    reverse: true,
  },
};

export const filterToObject = (
  type: string,
  filter: InputMaybe<ProductFilter>,
) => {
  if (type == "tag") {
    return { tag: filter?.tag };
  }
  if (type == "productType") {
    return { productType: filter?.productType };
  }
  if (type == "productVendor") {
    return { productVendor: filter?.productVendor };
  }
  if (type == "priceMin") {
    return { price: { min: filter?.price?.min } };
  }
  if (type == "priceMax") {
    return { price: { max: filter?.price?.max } };
  }
  if (type == "variantOption") {
    return { variantOption: filter?.variantOption };
  }
};

export const getFiltersByUrl = (url: URL) => {
  const filters: InputMaybe<ProductFilter[]> | undefined = [];
  url.searchParams.forEach((value, key) => {
    if (key.startsWith("filter.v.option")) {
      filters.push({
        variantOption: { name: key.split(".")[3], value: value },
      });
    } else if (key.startsWith("filter.p.tag")) {
      filters.push({ tag: value });
    } else if (key.startsWith("filter.p.type")) {
      filters.push({ productType: value });
    } else if (key.startsWith("filter.p.product_type")) {
      filters.push({ productType: value });
    } else if (key.startsWith("filter.p.vendor")) {
      filters.push({ productVendor: value });
    } else if (key.startsWith("filter.v.availability")) {
      filters.push({ available: value.toLowerCase() === "in stock" });
    } else if (key.startsWith("filter.v.price.gte")) {
      filters.push({ price: { min: Number(value) } });
    } else if (key.startsWith("filter.v.price.lte")) {
      filters.push({ price: { max: Number(value) } });
    }
  });
  return filters;
};

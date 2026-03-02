import type { Product } from "../../commerce/types.ts";
import { AppContext } from "../../shopify/mod.ts";
import {
  ProductsByCollection,
  SearchProducts,
} from "../utils/storefront/queries.ts";
import {
  CollectionProductsArgs,
  CountryCode,
  HasMetafieldsMetafieldsArgs,
  LanguageCode,
  ProductConnection,
  ProductFragment,
  QueryRoot,
  QueryRootCollectionArgs,
  QueryRootSearchArgs,
  SearchResultItemConnection,
} from "../utils/storefront/storefront.graphql.gen.ts";
import { toProduct } from "../utils/transform.ts";
import {
  CollectionSortKeys,
  SearchSortKeys,
  searchSortShopify,
  sortShopify,
} from "../utils/utils.ts";
import { LanguageContextArgs, Metafield } from "../utils/types.ts";

export interface QueryProps {
  /** @description search term to use on search */
  query: string;
  /** @description total number of items to display */
  count: number;
  /** @description sort products */
  sort?: SearchSortKeys;
}

export interface CollectionProps {
  /** @description collection name to use on search */
  collection: string;
  /** @description total number of items to display */
  count: number;
  /** @description sort products */
  sort?: CollectionSortKeys;
}

export interface FilterProps {
  /** product tags */
  tags?: string[];
  /** product types */
  productTypes?: string[];
  /** @description product brands */
  productVendors?: string[];
  /** @description minimum price */
  priceMin?: number;
  /** @description maximum price */
  priceMax?: number;
  /** @description variant options */
  variantOptions?: {
    /** @description for example: color */
    name: string;
    /** @description for example: red */
    value: string;
  }[];
}

export type Props = {
  props: QueryProps | CollectionProps;

  filters?: FilterProps;
  /**
   * @title Metafields
   * @description search for metafields
   */
  metafields?: Metafield[];
  /**
   * @title Language Code
   * @description Language code for the storefront API
   * @example "EN" for English, "FR" for French, etc.
   */
  languageCode?: LanguageCode;
  /**
   * @title Country Code
   * @description Country code for the storefront API
   * @example "US" for United States, "FR" for France, etc.
   */
  countryCode?: CountryCode;
};

// deno-lint-ignore no-explicit-any
const isQueryList = (p: any): p is QueryProps =>
  typeof p.query === "string" && typeof p.count === "number";

/**
 * @title Shopify Integration
 * @description Product List loader
 */
const loader = async (
  expandedProps: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { storefront } = ctx;

  const props = expandedProps.props ??
    (expandedProps as unknown as Props["props"]);

  const count = props.count ?? 12;
  const metafields = expandedProps.metafields || [];
  const languageCode = expandedProps?.languageCode ?? "PT";
  const countryCode = expandedProps?.countryCode ?? "BR";

  let shopifyProducts:
    | SearchResultItemConnection
    | ProductConnection
    | undefined = undefined;

  const sort = props.sort ?? "";

  const filters = [];
  expandedProps.filters?.tags?.forEach((tag) => {
    filters.push({ tag });
  });
  expandedProps.filters?.productTypes?.forEach((productType) => {
    filters.push({ productType });
  });
  expandedProps.filters?.productVendors?.forEach((productVendor) => {
    filters.push({ productVendor });
  });
  expandedProps.filters?.priceMin &&
    filters.push({ price: { min: expandedProps.filters.priceMin } });
  expandedProps.filters?.priceMax &&
    filters.push({ price: { max: expandedProps.filters.priceMax } });
  expandedProps.filters?.variantOptions?.forEach((variantOption) => {
    filters.push({ variantOption });
  });

  if (isQueryList(props)) {
    const data = await storefront.query<
      QueryRoot,
      QueryRootSearchArgs & HasMetafieldsMetafieldsArgs & LanguageContextArgs
    >({
      variables: {
        first: count,
        query: props.query,
        productFilters: filters,
        identifiers: metafields,
        languageCode,
        countryCode,
        ...searchSortShopify[sort],
      },
      ...SearchProducts,
    });
    shopifyProducts = data.search;
  } else {
    const data = await storefront.query<
      QueryRoot,
      & QueryRootCollectionArgs
      & CollectionProductsArgs
      & HasMetafieldsMetafieldsArgs
      & LanguageContextArgs
    >({
      variables: {
        first: count,
        handle: props.collection,
        filters,
        identifiers: metafields,
        languageCode,
        countryCode,
        ...sortShopify[sort],
      },
      ...ProductsByCollection,
    });

    shopifyProducts = data.collection?.products;
  }

  // Transform Shopify product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = shopifyProducts?.nodes.map((p) =>
    toProduct(
      p as ProductFragment,
      (p as ProductFragment).variants.nodes[0],
      new URL(req.url),
    )
  );

  return products ?? [];
};

export const cache = "stale-while-revalidate";
export const cacheKey = (expandedProps: Props, req: Request): string => {
  const props = expandedProps.props ??
    (expandedProps as unknown as Props["props"]);

  const count = (props.count ?? 12).toString();
  const sort = props.sort ?? "";
  const languageCode = expandedProps?.languageCode ?? "PT";
  const countryCode = expandedProps?.countryCode ?? "BR";
  const { metafields, filters } = expandedProps;

  const searchParams = new URLSearchParams();

  // Core parameters
  searchParams.append("count", count);
  searchParams.append("sort", sort);
  searchParams.append("languageCode", languageCode);
  searchParams.append("countryCode", countryCode);

  // Query or collection specific parameters
  if ("collection" in props) {
    searchParams.append("collection", props.collection);
  }

  if ("query" in props) {
    searchParams.append("query", props.query);
  }

  // Add metafields to cache key if they exist
  if (metafields?.length) {
    const metafieldsKey = metafields
      .map((m) => `${m.namespace}.${m.key}`)
      .sort()
      .join(",");
    searchParams.append("metafields", metafieldsKey);
  }

  // Add filters to cache key if they exist
  if (filters) {
    if (filters.tags?.length) {
      searchParams.append("tags", filters.tags.sort().join(","));
    }
    if (filters.productTypes?.length) {
      searchParams.append(
        "productTypes",
        filters.productTypes.sort().join(","),
      );
    }
    if (filters.productVendors?.length) {
      searchParams.append(
        "productVendors",
        filters.productVendors.sort().join(","),
      );
    }
    if (filters.priceMin !== undefined) {
      searchParams.append("priceMin", filters.priceMin.toString());
    }
    if (filters.priceMax !== undefined) {
      searchParams.append("priceMax", filters.priceMax.toString());
    }
    if (filters.variantOptions?.length) {
      const variantOptionsKey = filters.variantOptions
        .map((vo) => `${vo.name}:${vo.value}`)
        .sort()
        .join(",");
      searchParams.append("variantOptions", variantOptionsKey);
    }
  }

  // Sort parameters for consistent cache keys
  searchParams.sort();

  const url = new URL(req.url);
  url.search = searchParams.toString();

  return url.href;
};

export default loader;

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

const isQueryList = (p: QueryProps | CollectionProps): p is QueryProps =>
  "query" in p;

/**
 * @title Shopify Integration
 * @description Product List loader
 */
const loader = async (
  expandedProps: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const { storefront } = ctx;

  const props = expandedProps.props;
  const count = props.count ?? 12;
  const metafields = expandedProps.metafields ?? [];
  const languageCode: LanguageCode = expandedProps.languageCode ?? "PT";
  const countryCode: CountryCode = expandedProps.countryCode ?? "BR";
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

  if (expandedProps.filters?.priceMin !== undefined) {
    filters.push({ price: { min: expandedProps.filters.priceMin } });
  }

  if (expandedProps.filters?.priceMax !== undefined) {
    filters.push({ price: { max: expandedProps.filters.priceMax } });
  }

  expandedProps.filters?.variantOptions?.forEach((variantOption) => {
    filters.push({ variantOption });
  });

  console.log("[ProductList][START]", {
    requestId,
    url: req.url,
    count,
    sort,
    languageCode,
    countryCode,
    filtersCount: filters.length,
    metafieldsCount: metafields.length,
  });

  let shopifyProducts:
    | SearchResultItemConnection
    | ProductConnection
    | undefined;

  try {
    if (isQueryList(props)) {
      const data = await storefront.query<
        QueryRoot,
        QueryRootSearchArgs &
          HasMetafieldsMetafieldsArgs &
          LanguageContextArgs
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

      console.log("[ProductList][COST]", {
        requestId,
        cost: data ?? null,
      });
    } else {
      const data = await storefront.query<
        QueryRoot,
        QueryRootCollectionArgs &
          CollectionProductsArgs &
          HasMetafieldsMetafieldsArgs &
          LanguageContextArgs
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

      if (!data.collection) {
        console.error("[ProductList][NULL_COLLECTION]", {
          requestId,
          handle: props.collection,
          languageCode,
          countryCode,
        });
      }

      shopifyProducts = data.collection?.products;

      console.log("[ProductList][COST]", {
        requestId,
        cost: data ?? null,
      });
    }

    console.log("[ProductList][SUCCESS]", {
      requestId,
      nodesReturned: shopifyProducts?.nodes?.length ?? 0,
      durationMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error("[ProductList][ERROR]", {
      requestId,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      languageCode,
      countryCode,
      durationMs: Date.now() - startTime,
    });

    throw error;
  }

  const products = shopifyProducts?.nodes
    ?.map((p) => {
      try {
        return toProduct(
          p as ProductFragment,
      (p as ProductFragment).variants.nodes[0],
          new URL(req.url),
        );
      } catch (error) {
        console.error("[ProductList][TRANSFORM_ERROR]", {
          requestId,
          productId: p.id,
          message: error instanceof Error ? error.message : "Unknown error",
        });
        return null;
      }
    })
    .filter((p): p is Product => Boolean(p));

  console.log("[ProductList][END]", {
    requestId,
    finalCount: products?.length ?? 0,
    totalDurationMs: Date.now() - startTime,
  });

  return products ?? [];
};

export const cache = "stale-while-revalidate";

export const cacheKey = (expandedProps: Props, req: Request): string => {
  const props = expandedProps.props;

  const count = (props.count ?? 12).toString();
  const sort = props.sort ?? "";
  const languageCode = expandedProps.languageCode ?? "PT";
  const countryCode = expandedProps.countryCode ?? "BR";

  const searchParams = new URLSearchParams({
    count,
    sort,
    languageCode,
    countryCode,
  });

  if ("collection" in props) {
    searchParams.append("collection", props.collection);
  }

  if ("query" in props) {
    searchParams.append("query", props.query);
  }

  const url = new URL(req.url);
  url.search = searchParams.toString();

  return url.href;
};

export default loader;
import type { Product } from "../../commerce/types.ts";
import { AppContext } from "../../shopify/mod.ts";
import {
  CollectionProductsArgs,
  Product as ProductShopify,
  ProductConnection,
  QueryRoot,
  QueryRootCollectionArgs,
  QueryRootSearchArgs,
  SearchResultItemConnection,
} from "../utils/storefront/storefront.graphql.gen.ts";
import {
  ProductsByCollection,
  SearchProducts,
} from "../utils/storefront/queries.ts";
import { toProduct } from "../utils/transform.ts";
import { CollectionSortKeys, SearchSortKeys } from "../utils/utils.ts";
import { searchSortShopify, sortShopify } from "../utils/utils.ts";

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

  try {
    if (isQueryList(props)) {
      const data = await storefront.query<
        QueryRoot,
        QueryRootSearchArgs
      >({
        variables: {
          first: count,
          query: props.query,
          productFilters: filters,
          ...searchSortShopify[sort],
        },
        ...SearchProducts,
      });
      shopifyProducts = data.search;
    } else {
      const data = await storefront.query<
        QueryRoot,
        QueryRootCollectionArgs & CollectionProductsArgs
      >({
        variables: {
          first: count,
          handle: props.collection,
          filters,
          ...sortShopify[sort],
        },
        ...ProductsByCollection,
      });

      shopifyProducts = data.collection?.products;
    }
  } catch (e) {
    console.log(e);
  }

  // Transform Shopify product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = shopifyProducts?.nodes.map((p) =>
    toProduct(
      p as ProductShopify,
      (p as ProductShopify).variants.nodes[0],
      new URL(req.url),
    )
  );

  return products ?? [];
};

export default loader;

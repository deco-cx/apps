import type { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../../shopify/mod.ts";
import {
  ProductsByCollection,
  SearchProducts,
} from "../utils/storefront/queries.ts";
import {
  CollectionProductsArgs,
  HasMetafieldsMetafieldsArgs,
  Product,
  ProductConnection,
  QueryRoot,
  QueryRootCollectionArgs,
  QueryRootSearchArgs,
  SearchResultItemConnection,
} from "../utils/storefront/storefront.graphql.gen.ts";
import { toFilter, toProduct } from "../utils/transform.ts";
import { Metafield } from "../utils/types.ts";
import {
  getFiltersByUrl,
  searchSortOptions,
  searchSortShopify,
  sortOptions,
  sortShopify,
} from "../utils/utils.ts";

export interface Props {
  /**
   * @description overrides the query term at url
   */
  query?: string;
  /**
   * @title Collection Name
   * @description overrides the collection name at url
   */
  collectionName?: string;
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count: number;
  /**
   * @title Metafields
   * @description search for metafields
   */
  metafields?: Metafield[];
  /**
   * @title Starting page query parameter offset.
   * @description Set the starting page offset. Default to 1.
   */
  pageOffset?: number;
  /**
   * @hide
   * @description it is hidden because only page prop is not sufficient, we need cursors
   */
  page?: number;
  /**
   * @hide
   * @description at admin user do not know cursor, it is useful to invokes like show more products
   */
  startCursor?: string;
  /**
   * @hide
   * @description at admin user do not know cursor, it is useful to invokes like show more products
   */
  endCursor?: string;
  /**
   * @hide true
   * @description The URL of the page, used to override URL from request
   */
  pageHref?: string;
}

/**
 * @title Shopify Integration
 * @description Product Listing Page loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const url = new URL(props.pageHref || req.url);
  const { storefront } = ctx;

  const count = props.count ?? 12;
  const query = props.query || url.searchParams.get("q") || "";
  const currentPageoffset = props.pageOffset ?? 1;
  const pageParam = url.searchParams.get("page")
    ? Number(url.searchParams.get("page")) - currentPageoffset
    : 0;
  const page = props.page || pageParam;
  const endCursor = props.endCursor || url.searchParams.get("endCursor") || "";
  const startCursor = props.startCursor ||
    url.searchParams.get("startCursor") || "";
  const metafields = props.metafields || [];

  const isSearch = Boolean(query);
  let hasNextPage = false;
  let hasPreviousPage = false;

  let shopifyProducts:
    | SearchResultItemConnection
    | ProductConnection
    | undefined = undefined;
  let shopifyFilters = undefined;
  let records = undefined;
  let collectionTitle = undefined;
  let collectionDescription = undefined;

  const sort = url.searchParams.get("sort") ?? "";

  if (isSearch) {
    const data = await storefront.query<
      QueryRoot,
      QueryRootSearchArgs & HasMetafieldsMetafieldsArgs
    >({
      variables: {
        ...(!endCursor && { first: count }),
        ...(endCursor && { last: count }),
        ...(startCursor && { after: startCursor }),
        ...(endCursor && { before: endCursor }),
        query: query,
        productFilters: getFiltersByUrl(url),
        identifiers: metafields,
        ...searchSortShopify[sort],
      },
      ...SearchProducts,
    });

    shopifyProducts = data.search;
    shopifyFilters = data.search?.productFilters;
    records = data.search?.totalCount;
    hasNextPage = Boolean(data?.search?.pageInfo.hasNextPage ?? false);
    hasPreviousPage = Boolean(
      data?.search?.pageInfo.hasPreviousPage ?? false,
    );
  } else {
    // TODO: understand how accept more than one path
    // example: /collections/first-collection/second-collection
    const pathname = props.collectionName || url.pathname.split("/")[1];

    const data = await storefront.query<
      QueryRoot,
      & QueryRootCollectionArgs
      & CollectionProductsArgs
      & HasMetafieldsMetafieldsArgs
    >({
      variables: {
        ...(!endCursor && { first: count }),
        ...(endCursor && { last: count }),
        ...(startCursor && { after: startCursor }),
        ...(endCursor && { before: endCursor }),
        identifiers: metafields,
        handle: pathname,
        filters: getFiltersByUrl(url),
        ...sortShopify[sort],
      },
      ...ProductsByCollection,
    });

    shopifyProducts = data.collection?.products;
    shopifyFilters = data.collection?.products?.filters;
    hasNextPage = Boolean(
      data?.collection?.products.pageInfo.hasNextPage ?? false,
    );
    hasPreviousPage = Boolean(
      data?.collection?.products.pageInfo.hasPreviousPage ?? false,
    );
    collectionTitle = data.collection?.title;
    collectionDescription = data.collection?.description;
  }

  // Transform Shopify product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = shopifyProducts?.nodes?.map((
    p,
  ) => toProduct(p as Product, (p as Product).variants.nodes[0], url));

  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", (page + currentPageoffset + 1).toString());
    nextPage.set("startCursor", shopifyProducts?.pageInfo.endCursor ?? "");
    nextPage.delete("endCursor");
  }

  if (hasPreviousPage) {
    previousPage.set("page", (page + currentPageoffset - 1).toString());
    previousPage.set("endCursor", shopifyProducts?.pageInfo.startCursor ?? "");
    previousPage.delete("startCursor");
  }

  const filters = shopifyFilters?.map((filter) => toFilter(filter, url));
  const currentPage = page + currentPageoffset;

  return {
    "@type": "ProductListingPage",
    // TODO: Update breadcrumb when accept more than one path
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [{
        "@type": "ListItem" as const,
        name: isSearch ? query : url.pathname.split("/")[1],
        item: isSearch ? url.href : url.pathname,
        position: 2,
      }],
      numberOfItems: 1,
    },
    filters: filters ?? [],
    products: products ?? [],
    pageInfo: {
      nextPage: hasNextPage ? `?${nextPage}` : undefined,
      previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
      currentPage,
      records,
      recordPerPage: count,
    },
    sortOptions: isSearch ? searchSortOptions : sortOptions,
    seo: {
      title: collectionTitle || "",
      description: collectionDescription || "",
      canonical: `${url.origin}${url.pathname}${
        page >= 1 ? `?page=${page}` : ""
      }`,
    },
  };
};

export const cache = "no-cache";
export const cacheKey = (props: Props, req: Request): string | null => {
  const url = new URL(props.pageHref || req.url);

  if (url.searchParams.get("q")) return null;

  const count = (props.count ?? 12).toString();
  const query = props.query || "";
  const page = (props.page || Number(url.searchParams.get("page")) || 0)
    .toString();
  const endCursor = props.endCursor || url.searchParams.get("endCursor") || "";
  const startCursor = props.startCursor ||
    url.searchParams.get("startCursor") || "";
  const sort = url.searchParams.get("sort") ?? "";
  const searchParams = new URLSearchParams({
    count,
    query,
    page,
    endCursor,
    startCursor,
    sort,
  });

  url.searchParams.forEach((value, key) => {
    if (!key.startsWith("filter.")) return;

    searchParams.append(key, value);
  });

  searchParams.sort();

  url.search = searchParams.toString();

  return url.href;
};

export default loader;

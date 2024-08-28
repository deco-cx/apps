import type { Product } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";
import {
  isFilterParam,
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "../../utils/intelligentSearch.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { toProduct } from "../../utils/transform.ts";
import type { Item, ProductID, Sort } from "../../utils/types.ts";
import {
  LabelledFuzzy,
  mapLabelledFuzzyToFuzzy,
} from "./productListingPage.ts";
import { sortProducts } from "../../utils/transform.ts";
import { getFirstItemAvailable } from "../legacy/productListingPage.ts";

/**
 * @title Collection ID
 */
export interface CollectionProps extends CommonProps {
  // TODO: pattern property isn't being handled by RJSF
  /**
   * @title Collection ID
   * @description (e.g.: 150)
   * @pattern \d*
   * @format dynamic-options
   * @options vtex/loaders/collections/list.ts
   */
  collection: string;
  /**
   * @description search sort parameter
   */
  sort?: Sort;
  /** @description total number of items to display. Required for collection */
  count: number;
}

/**
 * @title Advanced Facets
 */
export interface FacetsProps extends CommonProps {
  /**
   * @description query to use on search
   * @examples "shoes"\n"blue shoes"
   */
  query: string;
  /**
   * @title Facets string
   * @description (e.g.: 'catergory-1/moda-feminina/category-2/calcados')
   * @pattern \d*
   */
  facets: string;
  /**
   * @description search sort parameter
   */
  sort?: Sort;
  /** @description total number of items to display. Required for collection */
  count: number;
}

/**
 * @title Keyword Search
 */
export interface QueryProps extends CommonProps {
  /**
   * @description query to use on search
   * @examples "shoes"\n"blue shoes"
   */
  query: string;
  /**
   * @description search sort parameter
   * @examples "price:asc"
   */
  sort?: Sort;
  /**
   * @description total number of items to display. Required for query
   * @examples 1\n2
   */
  count: number;

  /**
   * @title Fuzzy
   */
  fuzzy?: LabelledFuzzy;
}

/**
 * @title Product IDs
 */
export interface ProductIDProps extends CommonProps {
  /**
   * @description SKU ids to retrieve
   */
  ids: ProductID[];
}

export interface CommonProps {
  /**
   * @title Hide Unavailable Items
   * @description Do not return out of stock items
   */
  hideUnavailableItems?: boolean;
  /**
   * @description Include similar products
   * @deprecated Use product extensions instead
   */
  similars?: boolean;
}

/**
 * @title Select products by
 */
export interface Props {
  /**
   * @title Select products by
   */
  props: CollectionProps | QueryProps | ProductIDProps | FacetsProps;
}

// deno-lint-ignore no-explicit-any
const isCollectionList = (p: any): p is CollectionProps =>
  typeof p.collection === "string" && typeof p.count === "number";
// deno-lint-ignore no-explicit-any
const isFacetsList = (p: any): p is FacetsProps =>
  typeof p.facets === "string" && typeof p.count === "number";
// deno-lint-ignore no-explicit-any
const isQueryList = (p: any): p is QueryProps =>
  typeof p.query === "string" && typeof p.count === "number";
// deno-lint-ignore no-explicit-any
const isProductIDList = (p: any): p is ProductIDProps =>
  Array.isArray(p.ids) && p.ids.length > 0;

const fromProps = ({ props }: Props) => {
  if (isFacetsList(props)) {
    return {
      query: props.query,
      count: props.count || 12,
      sort: props.sort || "",
      selectedFacets: [{ key: "", value: props.facets }],
      hideUnavailableItems: props.hideUnavailableItems,
    } as const;
  }

  if (isProductIDList(props)) {
    return {
      query: `sku:${props.ids.join(";")}`,
      count: props.ids.length || 12,
      sort: "",
      selectedFacets: [],
      hideUnavailableItems: props.hideUnavailableItems,
    } as const;
  }

  if (isQueryList(props)) {
    return {
      query: props.query || "",
      count: props.count || 12,
      sort: props.sort || "",
      fuzzy: mapLabelledFuzzyToFuzzy(props.fuzzy),
      selectedFacets: [],
      hideUnavailableItems: props.hideUnavailableItems,
    } as const;
  }

  if (isCollectionList(props)) {
    return {
      query: "",
      count: props.count || 12,
      sort: props.sort || "",
      selectedFacets: [{ key: "productClusterIds", value: props.collection }],
      hideUnavailableItems: props.hideUnavailableItems,
    } as const;
  }

  throw new Error(`Unknown props: ${JSON.stringify(props)}`);
};

const preferredSKU = (items: Item[], { props }: Props) => {
  const fetchedSkus = new Set((props as ProductIDProps).ids ?? []);
  if (fetchedSkus.size > 0) {
    return items.find((item) => fetchedSkus.has(item.itemId)) || items[0];
  }
  return items.find(getFirstItemAvailable) || items[0];
};

/**
 * @title VTEX Integration - Intelligent Search
 * @description Product List loader
 */
const loader = async (
  expandedProps: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const props = expandedProps.props ??
    (expandedProps as unknown as Props["props"]);
  const { vcsDeprecated } = ctx;
  const { url } = req;
  const segment = getSegmentFromBag(ctx);

  const { selectedFacets, ...args } = fromProps({ props });
  const params = withDefaultParams(args);
  const facets = withDefaultFacets(selectedFacets, ctx);

  const { products: vtexProducts } = await vcsDeprecated
    ["GET /api/io/_v/api/intelligent-search/product_search/*facets"]({
      ...params,
      facets: toPath(facets),
    }, { ...STALE, headers: withSegmentCookie(segment) })
    .then((res) => res.json());

  const options = {
    baseUrl: url,
    priceCurrency: segment?.payload?.currencyCode ?? "BRL",
  };

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  let products = vtexProducts?.map((p) =>
    toProduct(p, preferredSKU(p.items, { props }), 0, options)
  );

  if (isProductIDList(props)) {
    products = sortProducts(products, props.ids || [], "sku");
  }

  return Promise.all(
    products.map((product) =>
      props.similars ? withIsSimilarTo(req, ctx, product) : product
    ),
  );
};

type Entry = [string, string];

const getSearchParams = (
  props: Props["props"],
  searchParams: URLSearchParams,
): Entry[] => {
  if (isFacetsList(props)) {
    return [
      ["query", props.query ?? searchParams.get("q")],
      ["count", (props.count || searchParams.get("count") || 12).toString()],
      ["sort", props.sort || searchParams.get("sort") || ""],
      ["selectedFacets", props.facets],
      [
        "hideUnavailableItems",
        (props.hideUnavailableItems ?? false).toString(),
      ],
    ];
  }

  if (isQueryList(props)) {
    return [
      ["query", props.query ?? searchParams.get("q")],
      ["count", (props.count || searchParams.get("count") || 12).toString()],
      ["sort", props.sort || searchParams.get("sort") || ""],
      ["fuzzy", mapLabelledFuzzyToFuzzy(props.fuzzy) ?? ""],
      [
        "hideUnavailableItems",
        (props.hideUnavailableItems ?? false).toString(),
      ],
    ];
  }

  if (isCollectionList(props)) {
    return [
      ["count", (props.count || searchParams.get("count") || 12).toString()],
      ["sort", props.sort || searchParams.get("sort") || ""],
      ["collection", props.collection],
      [
        "hideUnavailableItems",
        (props.hideUnavailableItems ?? false).toString(),
      ],
    ];
  }

  return [];
};

export const cache = "stale-while-revalidate";

export const cacheKey = (
  expandedProps: Props,
  req: Request,
  ctx: AppContext,
) => {
  const props = expandedProps.props ??
    (expandedProps as unknown as Props["props"]);

  const url = new URL(req.url);
  if (
    url.searchParams.has("q") ||
    ctx.isInvoke && isProductIDList(props)
  ) {
    return null;
  }
  const segment = getSegmentFromBag(ctx)?.token ?? "";
  const params = new URLSearchParams([
    ...getSearchParams(props, url.searchParams),
    ["segment", segment],
  ]);

  if (
    isProductIDList(props)
  ) {
    const productIds = [props.ids ?? []].sort();
    params.append("productids", productIds.join(","));
  }

  url.searchParams.forEach((value, key) => {
    // Add filter filter.category-1, filter.category-2, filter.colors, filter.price, filter.size
    if (!isFilterParam(key)) return;
    params.append(key, value);
  });

  params.sort();

  url.search = params.toString();

  return url.href;
};

export default loader;

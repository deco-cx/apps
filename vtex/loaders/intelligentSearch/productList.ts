import type { Product } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import {
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "../../utils/intelligentSearch.ts";
import { SEGMENT, withSegmentCookie } from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { toProduct } from "../../utils/transform.ts";
import type { ProductID, Sort } from "../../utils/types.ts";

export interface CollectionProps extends CommonProps {
  // TODO: pattern property isn't being handled by RJSF
  /**
   * @title Collection ID (e.g.: 139)
   * @pattern \d*
   */
  collection: string;
  /**
   * @description search sort parameter
   */
  sort?: Sort;
  /** @description total number of items to display. Required for collection */
  count: number;
}

export interface QueryProps extends CommonProps {
  /** @description query to use on search */
  query: string;
  /**
   * @description search sort parameter
   */
  sort?: Sort;
  /** @description total number of items to display. Required for query */
  count: number;
}

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
   */
  similars?: boolean;
}

export type Props = { props: CollectionProps | QueryProps | ProductIDProps };

// deno-lint-ignore no-explicit-any
const isCollectionList = (p: any): p is CollectionProps =>
  typeof p.collection === "string" && typeof p.count === "number";
// deno-lint-ignore no-explicit-any
const isQueryList = (p: any): p is QueryProps =>
  typeof p.query === "string" && typeof p.count === "number";
// deno-lint-ignore no-explicit-any
const isProductIDList = (p: any): p is ProductIDProps =>
  Array.isArray(p.ids) && p.ids.length > 0;

const fromProps = ({ props }: Props) => {
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
  const { vcs } = ctx;
  const { url } = req;
  const segment = ctx.bag.get(SEGMENT);

  const { selectedFacets, ...args } = fromProps({ props });
  const params = withDefaultParams(args);
  const facets = withDefaultFacets(selectedFacets, ctx);

  // search products on VTEX. Feel free to change any of these parameters
  const { products: vtexProducts } = await vcs
    ["GET /api/io/_v/api/intelligent-search/product_search/*facets"]({
      ...params,
      facets: toPath(facets),
    }, {
      deco: { cache: "stale-while-revalidate" },
      headers: withSegmentCookie(segment),
    }).then((res) => res.json());

  const options = {
    baseUrl: url,
    priceCurrency: "BRL", // config!.defaultPriceCurrency, // TOO
  };

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = vtexProducts
    .map((p) => toProduct(p, p.items[0], 0, options));

  return Promise.all(
    products.map((product) =>
      props.similars ? withIsSimilarTo(req, ctx, product) : product
    ),
  );
};

export default loader;

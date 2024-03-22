import type { Product } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";
import { toSegmentParams } from "../../utils/legacy.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { toProduct } from "../../utils/transform.ts";
import type { LegacyItem, LegacySort } from "../../utils/types.ts";
import { sortProducts } from "../../utils/transform.ts";

export interface CollectionProps extends CommonProps {
  // TODO: pattern property isn't being handled by RJSF
  /**
   * @description Collection ID or (Product Cluster id). For more info: https://developers.vtex.com/docs/api-reference/search-api#get-/api/catalog_system/pub/products/search .
   * @pattern \d*
   * @format dynamic-options
   * @options vtex/loaders/collections/list.ts
   */
  collection: string;
  /**
   * @description search sort parameter
   */
  sort?: LegacySort;
  /** @description total number of items to display */
  count: number;
}

export interface TermProps extends CommonProps {
  /** @description term to use on search */
  term?: string;
  /**
   * @description search sort parameter
   */
  sort?: LegacySort;
  /** @description total number of items to display */
  count: number;
}

export interface FQProps extends CommonProps {
  /** @description fq's */
  fq: string[];

  /**
   * @description search sort parameter
   */
  sort?: LegacySort;

  /** @description total number of items to display */
  count: number;
}

export interface SkuIDProps extends CommonProps {
  /**
   * @description SKU ids to retrieve
   */
  ids?: string[];
}

export interface ProductIDProps extends CommonProps {
  /**
   * @description Product ids to retrieve
   */
  productIds?: string[];
}

export interface CommonProps {
  /**
   * @description Include similar products
   * @deprecated Use product extensions instead
   */
  similars?: boolean;
}

export type Props = {
  props:
    | CollectionProps
    | TermProps
    | ProductIDProps
    | SkuIDProps
    | FQProps;
};

// deno-lint-ignore no-explicit-any
const isCollectionProps = (p: any): p is CollectionProps =>
  typeof p.collection === "string" && typeof p.count === "number";

// deno-lint-ignore no-explicit-any
const isValidArrayProp = (prop: any) => Array.isArray(prop) && prop.length > 0;

// deno-lint-ignore no-explicit-any
const isSKUIDProps = (p: any): p is SkuIDProps => isValidArrayProp(p.ids);

// deno-lint-ignore no-explicit-any
const isProductIDProps = (p: any): p is ProductIDProps =>
  isValidArrayProp(p.productIds);

// deno-lint-ignore no-explicit-any
const isFQProps = (p: any): p is FQProps => isValidArrayProp(p.fq);

const preferredSKU = (items: LegacyItem[], { props }: Props) => {
  const fetchedSkus = new Set((props as SkuIDProps).ids ?? []);
  return items.find((item) => fetchedSkus.has(item.itemId)) || items[0];
};

const fromProps = ({ props }: Props) => {
  const params = { fq: [] } as {
    _from?: number;
    _to?: number;
    fq: string[];
    ft?: string;
    O?: LegacySort;
  };

  if (isSKUIDProps(props)) {
    const skuIds = props.ids || [];

    skuIds.forEach((skuId) => params.fq.push(`skuId:${skuId}`));
    params._from = 0;
    params._to = Math.max(skuIds.length - 1, 0);

    return params;
  }

  if (isProductIDProps(props)) {
    const productIds = props.productIds || [];

    productIds.forEach((productId) => params.fq.push(`productId:${productId}`));
    params._from = 0;
    params._to = Math.max(productIds.length - 1, 0);

    return params;
  }

  const count = props.count ?? 12;
  params._from = 0;
  params._to = Math.max(count - 1, 0);
  if (props.sort) {
    params.O = props.sort;
  }

  if (isCollectionProps(props)) {
    params.fq.push(`productClusterIds:${props.collection}`);

    return params;
  }

  if (isFQProps(props)) {
    params.fq = props.fq;

    return params;
  }

  if (props.term) {
    params.ft = encodeURIComponent(props.term);
  }

  return params;
};

/**
 * @title VTEX Integration - Legacy Search
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
  const { url: baseUrl } = req;
  const segment = getSegmentFromBag(ctx) ?? {};
  const segmentParams = toSegmentParams(segment ?? {});
  const params = fromProps({ props });

  const vtexProducts = await vcsDeprecated
    ["GET /api/catalog_system/pub/products/search/:term?"]({
      ...segmentParams,
      ...params,
    }, { ...STALE, headers: withSegmentCookie(segment) })
    .then((res) => res.json());

  if (vtexProducts && !Array.isArray(vtexProducts)) {
    throw new Error(
      `Error while fetching VTEX data ${JSON.stringify(vtexProducts)}`,
    );
  }

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  let products = vtexProducts.map((p) =>
    toProduct(p, preferredSKU(p.items, { props }), 0, {
      baseUrl: baseUrl,
      priceCurrency: segment?.payload?.currencyCode ?? "BRL",
    })
  );

  if (isSKUIDProps(props)) {
    products = sortProducts(products, props.ids || [], "sku");
  }

  if (isProductIDProps(props)) {
    products = sortProducts(
      products,
      props.productIds || [],
      "inProductGroupWithID",
    );
  }

  return Promise.all(
    products.map((product) =>
      props.similars ? withIsSimilarTo(req, ctx, product) : product
    ),
  );
};

export { cache, cacheKey } from "../../utils/cacheBySegment.ts";

export default loader;

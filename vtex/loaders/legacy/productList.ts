import type { Product } from "../../../commerce/types.ts";
import { fetchAPI } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";
import { toSegmentParams } from "../../utils/legacy.ts";
import { paths } from "../../utils/paths.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { toProduct } from "../../utils/transform.ts";
import type {
  LegacyProduct,
  LegacySort,
  ProductID,
} from "../../utils/types.ts";

export interface CollectionProps extends CommonProps {
  // TODO: pattern property isn't being handled by RJSF
  /**
   * @description Collection ID or (Product Cluster id). For more info: https://developers.vtex.com/docs/api-reference/search-api#get-/api/catalog_system/pub/products/search .
   * @pattern \d*
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

export interface ProductIDProps extends CommonProps {
  /**
   * @description SKU ids to retrieve
   */
  ids: ProductID[];
}

export interface CommonProps {
  /**
   * @description Include similar products
   */
  similars?: boolean;
}

export type Props = CollectionProps | TermProps | ProductIDProps | FQProps;

// deno-lint-ignore no-explicit-any
const isCollectionProps = (p: any): p is CollectionProps =>
  typeof p.collection === "string" && typeof p.count === "number";

// deno-lint-ignore no-explicit-any
const isProductIDProps = (p: any): p is ProductIDProps =>
  Array.isArray(p.ids) && p.ids.length > 0;

// deno-lint-ignore no-explicit-any
const isFQProps = (p: any): p is FQProps =>
  Array.isArray(p.fq) && p.fq.length > 0;

const fromProps = (
  props: Props,
  params = new URLSearchParams(),
): URLSearchParams => {
  if (isProductIDProps(props)) {
    props.ids.forEach((skuId) => params.append("fq", `skuId:${skuId}`));
    params.set("_from", "0");
    params.set("_to", `${Math.max(props.ids.length - 1, 0)}`);

    return params;
  }

  const count = props.count ?? 12;
  params.set("_from", "0");
  params.set("_to", `${Math.max(count - 1, 0)}`);
  props.sort && params.set("O", props.sort);

  if (isCollectionProps(props)) {
    params.set("fq", `productClusterIds:${props.collection}`);

    return params;
  }

  if (isFQProps(props)) {
    props.fq.forEach((fq) => params.append("fq", fq));

    return params;
  }

  props.term && params.set("ft", encodeURIComponent(props.term));

  return params;
};

/**
 * @title VTEX Integration - Legacy Search
 * @description Product List loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { url: baseUrl } = req;
  const segment = getSegment(req);
  const segmentParams = toSegmentParams(segment);
  const params = fromProps(props, segmentParams);

  const vtexProducts = await fetchAPI<LegacyProduct[]>(
    `${paths(ctx).api.catalog_system.pub.products.search}?${params}`,
    {
      deco: { cache: "stale-while-revalidate" },
      headers: withSegmentCookie(segment),
    },
  );

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = vtexProducts.map((p) =>
    toProduct(p, p.items[0], 0, {
      baseUrl: baseUrl,
      priceCurrency: "BRL", // config!.defaultPriceCurrency, // TODO fix currency
    })
  );

  setSegment(segment, ctx.response.headers);

  return Promise.all(
    products.map((product) =>
      props.similars ? withIsSimilarTo(ctx, product) : product
    ),
  );
};

export default loader;

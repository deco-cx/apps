import type { LoaderFunction } from "deco/types.ts";
import type { Product } from "../../../commerce/types.ts";
import type { AppContext } from "../mod.ts";

export interface Props {
  /** @description total number of items to display */
  count: number;
  /** @description query to use on search */
  query?: string;
  /**
   * @description Collection ID or (Product Cluster id). For more info: https://developers.vtex.com/docs/api-reference/search-api#get-/api/catalog_system/pub/products/search .
   * @pattern \d*
   */
  collection?: string[];
}

/**
 * @title VTEX Legacy - Search Products (deprecated)
 * @description Useful for shelves and static galleries.
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  Props,
  Product[] | null,
  AppContext
> = async (
  _req,
  ctx,
  props,
) => {
  const p = props.query
    ? { term: props.query, count: props.count }
    : { collection: props.collection?.[0], count: props.count };

  const data = await ctx.state.invoke["deco-sites/std"].loaders.vtex.legacy
    .productList({ props: p });

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;

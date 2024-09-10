import type { LoaderFunction } from "deco/types.ts";
import type { Product } from "../../../commerce/types.ts";
import type { AppContext } from "../mod.ts";

export interface Props {
  /** @description query to use on search */
  query: string;
  /** @description total number of items to display */
  count: number;
  //* @enumNames ["relevance", "greater discount", "arrivals", "name asc", "name desc", "most ordered", "price asc", "price desc"]
  /**
   * @description search sort parameter
   */
  sort?:
    | ""
    | "price:desc"
    | "price:asc"
    | "orders:desc"
    | "name:desc"
    | "name:asc"
    | "release:desc"
    | "discount:desc";

  // TODO: pattern property isn't being handled by RJSF
  /**
   * @title Collection ID
   * @pattern \d*
   */
  collection?: string[];
}

/**
 * @title VTEX Intelligent Search - Search Products (deprecated)
 * @description Use it in Shelves and static Galleries.
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
  const { query, collection, count, sort } = props;
  const p = query ? { query } : { collection: collection?.[0] };

  const data = await ctx.state.invoke["deco-sites/std"].loaders.vtex
    .intelligentSearch.productList(
      // deno-lint-ignore no-explicit-any
      { ...p, count, sort } as any,
    );

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;

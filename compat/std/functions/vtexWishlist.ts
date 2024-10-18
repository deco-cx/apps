import type { ProductListingPage } from "../../../commerce/types.ts";
import type { Props } from "../../../vtex/loaders/wishlist.ts";
import { Product } from "../../../vtex/utils/types.ts";
import type { AppContext } from "../mod.ts";
import { type LoaderFunction } from "@deco/deco";
/**
 * @title VTEX - Load Wishlist
 * @description Used with vtex.wish-list app
 * @deprecated true
 */
const loaderV0: LoaderFunction<Props, ProductListingPage | null, AppContext> =
  async (_req, ctx, props) => {
    // deno-lint-ignore no-explicit-any
    const data = (await ctx.state.invoke["deco-sites/std"].loaders.vtex as any)
      .wishlist(props);
    return {
      data: await ctx.state.invoke["deco-sites/std"].loaders.vtex
        .intelligentSearch.productListingPage({
          query: `product:${
            (data as Product[]).map((p) => p.productId).join(";")
          }`,
          count: props.count,
        }),
    };
  };
export default loaderV0;

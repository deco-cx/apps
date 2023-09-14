import type { LoaderFunction } from "deco/types.ts";
import type { ProductListingPage } from "../../../commerce/types.ts";
import type { Props } from "../../../vtex/loaders/wishlist.ts";
import type { AppContext } from "../mod.ts";

/**
 * @title VTEX - Load Wishlist
 * @description Used with vtex.wish-list app
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  Props,
  ProductListingPage | null,
  AppContext
> = async (
  _req,
  ctx,
  props,
) => {
  const data = await ctx.state.invoke["deco-sites/std"].loaders.vtex.wishlist(
    props,
  );

  return {
    data: await ctx.state.invoke["deco-sites/std"].loaders.vtex
      .intelligentSearch.productListingPage(
        {
          query: `product:${data.map((p) => p.productId).join(";")}`,
          count: props.count,
        },
      ),
  };
};

export default loaderV0;

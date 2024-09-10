import type { LoaderFunction } from "deco/types.ts";
import type { ProductListingPage } from "../../../commerce/types.ts";
import type {
  Props,
} from "../../../vtex/loaders/intelligentSearch/productListingPage.ts";
import type { AppContext } from "../mod.ts";

/**
 * @title VTEX Intelligent Search - Product Listing page (deprecated)
 * @description Useful for category, search, brand and collection pages.
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
  const data = await ctx.state.invoke["deco-sites/std"].loaders.vtex
    .intelligentSearch.productListingPage(
      props,
    );

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;

import type { LoaderFunction } from "deco/types.ts";
import type { ProductListingPage } from "../../../commerce/types.ts";
import type { Props } from "../../../vtex/loaders/legacy/productListingPage.ts";
import type { AppContext } from "../mod.ts";

/**
 * @title VTEX Catalog - Product Listing Page (deprecated)
 * @description Useful for category, search, brand and collection pages.
 * @deprecated
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
  const data = await ctx.state.invoke["deco-sites/std"].loaders.vtex.legacy
    .productListingPage(
      {
        ...props,
        term: props.term || ctx.params["0"],
      },
    );

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;

import type { LoaderFunction } from "deco/types.ts";
import type { ProductDetailsPage } from "../../../commerce/types.ts";
import type { AppContext } from "../mod.ts";

/**
 * @title VTEX Catalog - Product Details Page (deprecated)
 * @description Works on routes of type /:slug/p
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  null,
  ProductDetailsPage | null,
  AppContext
> = async (
  _req,
  ctx,
) => {
  const data = await ctx.state.invoke["deco-sites/std"].loaders.vtex.legacy
    .productDetailsPage(
      { slug: ctx.params.slug },
    );

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;

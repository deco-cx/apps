import type { LoaderFunction } from "deco/types.ts";
import type { Product } from "../../../commerce/types.ts";
import type { CrossSellingType } from "../../../vtex/utils/types.ts";
import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Related Products
   * @description VTEX Cross Selling API. This loader only works on routes of type /:slug/p
   */
  crossSelling: CrossSellingType;
  /**
   * @description: number of related products
   */
  count?: number;
}

/**
 * @title VTEX Catalog - Related Products (deprecated)
 * @description Works on routes of type /:slug/p
 * @deprecated
 */
const loaderV0: LoaderFunction<
  Props,
  Product[] | null,
  AppContext
> = async (
  _req,
  ctx,
  { crossSelling, count },
) => {
  const data = await ctx.state.invoke["deco-sites/std"].loaders.vtex.legacy
    .relatedProductsLoader(
      {
        slug: ctx.params.slug,
        crossSelling,
        count,
      },
    );

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;

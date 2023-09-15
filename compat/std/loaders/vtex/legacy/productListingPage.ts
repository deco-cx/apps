import type { ProductListingPage } from "../../../../../commerce/types.ts";
import {
  Props,
} from "../../../../../vtex/loaders/legacy/productListingPage.ts";
import { VTEXContext } from "../../../mod.ts";

/**
 * @title VTEX Integration - Legacy Search
 * @description Product Listing Page loader
 * @deprecated true
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: VTEXContext,
): Promise<ProductListingPage | null> => {
  return await ctx.invoke.vtex.loaders.legacy.productListingPage(
    props,
  );
};

export default loader;

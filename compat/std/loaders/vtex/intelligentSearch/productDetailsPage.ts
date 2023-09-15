import type { ProductDetailsPage } from "../../../../../commerce/types.ts";
import {
  Props,
} from "../../../../../vtex/loaders/intelligentSearch/productDetailsPage.ts";
import { VTEXContext } from "../../../mod.ts";

/**
 * @title VTEX Integration - Intelligent Search
 * @description Product Details Page loader
 * @deprecated true
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: VTEXContext,
): Promise<ProductDetailsPage | null> => {
  return await ctx.invoke.vtex.loaders.intelligentSearch.productDetailsPage(
    props,
  );
};

export default loader;

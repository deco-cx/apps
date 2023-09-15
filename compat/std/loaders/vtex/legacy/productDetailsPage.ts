import type { ProductDetailsPage } from "../../../../../commerce/types.ts";
import {
  Props,
} from "../../../../../vtex/loaders/legacy/productDetailsPage.ts";
import { VTEXContext } from "../../../mod.ts";

/**
 * @title VTEX Integration - Legacy Search
 * @description Product Details Page loader
 * @deprecated true
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: VTEXContext,
): Promise<ProductDetailsPage | null> => {
  return await ctx.invoke.vtex.loaders.legacy.productDetailsPage(props);
};

export default loader;

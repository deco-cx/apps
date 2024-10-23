import type { Product } from "../../../../../commerce/types.ts";
import {
  Props,
} from "../../../../../vtex/loaders/legacy/relatedProductsLoader.ts";
import { VTEXContext } from "../../../mod.ts";

/**
 * @title VTEX Integration - Related Products
 * @description Related Products loader
 * @deprecated true
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: VTEXContext,
): Promise<Product[] | null> => {
  return await ctx.invoke.vtex.loaders.legacy.relatedProductsLoader(
    props,
  );
};

export default loader;

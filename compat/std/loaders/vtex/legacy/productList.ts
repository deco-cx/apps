import type { Product } from "../../../../../commerce/types.ts";
import { Props } from "../../../../../vtex/loaders/legacy/productList.ts";
import { VTEXContext } from "../../../mod.ts";

/**
 * @title VTEX Integration - Legacy Search
 * @description Product List loader
 * @deprecated true
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: VTEXContext,
): Promise<Product[] | null> => {
  return await ctx.invoke.vtex.loaders.legacy.productList(props);
};

export default loader;

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

// A pass-through: the VTEX loader it invokes caches (or vetoes the page
// cache) on its own. Without this, deco's `no-store` default would make every
// page that uses this loader `no-store`.
export const cache = "no-cache";

export default loader;

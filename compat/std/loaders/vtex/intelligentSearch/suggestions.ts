import type { Suggestion } from "../../../../../commerce/types.ts";
import {
  Props,
} from "../../../../../vtex/loaders/intelligentSearch/suggestions.ts";
import { VTEXContext } from "../../../mod.ts";

/**
 * @title VTEX Integration - Intelligent Search
 * @description Product Suggestion loader
 * @deprecated true
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: VTEXContext,
): Promise<Suggestion | null> => {
  return await ctx.invoke.vtex.loaders.intelligentSearch.suggestions(
    props,
  );
};

// A pass-through: the VTEX loader it invokes caches (or vetoes the page
// cache) on its own. Without this, deco's `no-store` default would make every
// page that uses this loader `no-store`.
export const cache = "no-cache";

export default loader;

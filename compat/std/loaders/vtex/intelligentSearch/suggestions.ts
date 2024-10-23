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

export default loader;

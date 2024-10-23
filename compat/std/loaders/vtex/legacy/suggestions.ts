import type { Suggestion } from "../../../../../commerce/types.ts";
import { Props } from "../../../../../vtex/loaders/legacy/suggestions.ts";
import { VTEXContext } from "../../../mod.ts";

/**
 * @title VTEX Integration - Legacy
 * @deprecated true
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: VTEXContext,
): Promise<Suggestion | null> => {
  return await ctx.invoke.vtex.loaders.legacy.suggestions(
    props,
  );
};

export default loader;

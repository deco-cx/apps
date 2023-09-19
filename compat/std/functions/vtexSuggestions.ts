import type { LoaderFunction } from "deco/types.ts";
import type { Suggestion } from "../../../commerce/types.ts";
import type { Props } from "../../../vtex/loaders/intelligentSearch/suggestions.ts";
import type { AppContext } from "../mod.ts";

/**
 * @title VTEX Intelligent Search - Search Suggestions (deprecated)
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  Props,
  Suggestion | null,
  AppContext
> = async (_req, ctx, props) => {
  const data = await ctx.state.invoke["deco-sites/std"].loaders.vtex
    .intelligentSearch.suggestions(
      props,
    );

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;

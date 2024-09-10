import type { LoaderFunction } from "@deco/deco";
import type { Navbar } from "../../../commerce/types.ts";
import type { Props } from "../../../vtex/loaders/navbar.ts";
import type { AppContext } from "../mod.ts";

/**
 * @title Navigation Bar
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  Props,
  Navbar[] | null,
  AppContext
> = async (_req, ctx, props) => {
  const data = await ctx.state.invoke["deco-sites/std"].loaders.vtex.navbar(
    props,
  );

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;

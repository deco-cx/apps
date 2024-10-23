import { Props } from "../../../../vtex/loaders/proxy.ts";
import { Route } from "../../../../website/flags/audience.ts";
import { VTEXContext } from "../../mod.ts";

/**
 * @title VTEX Proxy Routes
 * @deprecated true
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: VTEXContext,
): Promise<Route[]> => {
  return await ctx.invoke.vtex.loaders.proxy(props);
};

export default loader;

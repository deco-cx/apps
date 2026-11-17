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

// A pass-through: the VTEX loader it invokes caches (or vetoes the page
// cache) on its own. Without this, deco's `no-store` default would make every
// page that uses this loader `no-store`.
export const cache = "no-cache";

export default loader;

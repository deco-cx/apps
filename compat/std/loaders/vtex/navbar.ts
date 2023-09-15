import type { Navbar } from "../../../../commerce/types.ts";
import { Props } from "../../../../vtex/loaders/navbar.ts";
import { VTEXContext } from "../../mod.ts";

/**
 * @title Navbar
 * @deprecated true
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: VTEXContext,
): Promise<Navbar[] | null> => {
  return await ctx.invoke.vtex.loaders.navbar(props);
};

export default loader;

import { AppContext } from "../../mod.ts";
import { Props, Returns } from "../releases/get.ts";

const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Returns["blocks"] | null> => {
  const release = await ctx.invoke(
    "deco-sites/admin/loaders/releases/get.ts",
    props,
  );

  return release?.blocks ?? null;
};

export default loader;

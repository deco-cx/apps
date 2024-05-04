import { AppContext, BlockState } from "../../mod.ts";

export interface Props {
  site: string;
  blockId: string;
}

export default async function Revision(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BlockState | null> {
  return await ctx.invoke["deco-sites/admin"].loaders.blocks.latest(props);
}

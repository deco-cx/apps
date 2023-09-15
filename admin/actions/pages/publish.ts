import { AppContext, BlockState } from "../../mod.ts";

export interface Props {
  site: string;
  pageId: string;
}

export default async function Publish(
  { site, pageId: blockId }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BlockState | null> {
  return await ctx.invoke["deco-sites/admin"].loaders.blocks.latest({
    site,
    blockId,
  });
}

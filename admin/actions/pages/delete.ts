import { AppContext } from "../../mod.ts";

export interface Props {
  pageId: string;
  site: string;
  release?: string;
}

export default async function DeletePage(
  { pageId }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  await await ctx.invoke["deco-sites/admin"].actions.blocks.delete({
    blockId: pageId,
  });
}

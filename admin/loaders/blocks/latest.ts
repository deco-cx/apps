import { ANONYMOUS, AppContext, BlockState } from "../../mod.ts";

export interface Props {
  site: string;
  blockId: string;
}

export default async function Latest(
  { blockId, site }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BlockState | null> {
  const state = await ctx.storage.state({
    forceFresh: true,
  });

  const block = state[blockId];
  if (!block) {
    return null;
  }

  return {
    site,
    id: blockId,
    createdAt: new Date(),
    createdBy: ANONYMOUS,
    revision: await ctx.storage.revision(),
    resolveType: block.__resolveType,
    value: block,
  };
}

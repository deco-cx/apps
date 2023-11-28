import { Resolvable } from "deco/engine/core/resolver.ts";
import { ANONYMOUS, AppContext, BlockState } from "../../mod.ts";

export interface Props {
  site: string;
  blockId: string;
  block: Resolvable;
}

export default async function NewRevision(
  { blockId, site, block }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BlockState | null> {
  await ctx.storage.patch({ [blockId]: block });

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

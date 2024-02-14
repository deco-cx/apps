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
  const newHead = await ctx.storage.patchDecofile(site, (decofile) => {
    decofile[blockId] = block;
    return Promise.resolve();
  });

  return {
    site,
    id: blockId,
    createdAt: new Date(),
    createdBy: ANONYMOUS,
    revision: newHead,
    resolveType: block.__resolveType,
    value: block,
  };
}

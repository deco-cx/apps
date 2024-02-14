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
  const repo = await ctx.storage.getRepository(site);
  const stash = repo.workingTree();

  const block = stash.state()[blockId];
  if (!block) {
    return null;
  }

  return {
    site,
    id: blockId,
    createdAt: new Date(),
    createdBy: ANONYMOUS,
    revision: repo.head!,
    resolveType: block.__resolveType,
    value: block,
  };
}

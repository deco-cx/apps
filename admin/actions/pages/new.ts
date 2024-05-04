import { ANONYMOUS, AppContext, BlockState } from "../../mod.ts";

const PAGE_RESOLVE_TYPE = "website/pages/Page.tsx";

export interface Props {
  name: string;
  path: string;
  site: string;
  schema: string;
  siteLivePage?: string;
  copyFrom?: {
    blockId: string;
  };
}

export default async function NewPage(
  { name, path, site, copyFrom }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BlockState | null> {
  const copiedPage = copyFrom
    ? await ctx.invoke["deco-sites/admin"].loaders.blocks
      .published({ blockId: copyFrom.blockId })
      .then((r: BlockState | null) => {
        if (!r?.value) return;
        return { ...r.value, name, path };
      })
    : undefined;

  const initialValue = copiedPage || {
    __resolveType: PAGE_RESOLVE_TYPE,
    name,
    path,
    sections: [],
  };

  const uniqueId = crypto.randomUUID().slice(24);
  const blockId = `pages-${
    name
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/\//g, "-")
  }-${uniqueId}`;

  await ctx.storage.patch({ [blockId]: initialValue });

  return {
    site,
    id: blockId,
    createdAt: new Date(),
    createdBy: ANONYMOUS,
    revision: await ctx.storage.revision(),
    resolveType: PAGE_RESOLVE_TYPE,
    value: initialValue,
  };
}

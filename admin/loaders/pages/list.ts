import { AppContext, BlockMetadata } from "../../mod.ts";
import { Pagination } from "../../types.ts";

export const PAGE_RESOLVE_TYPES = [
  "website/pages/Page.tsx",
  "$live/pages/LivePage.tsx",
];

export default async function ListPages(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Pagination<BlockMetadata> | null> {
  const state = await ctx.storage.state();

  if (!state) {
    return {
      data: [],
      page: 0,
      pageSize: 0,
      total: 0,
    };
  }

  const data = Object.entries(state)
    .map(([id, { __resolveType, ...blockState }]) => ({
      id,
      ...(blockState as Omit<BlockMetadata, "id">),
      module: __resolveType,
    }))
    .filter((block) => PAGE_RESOLVE_TYPES.includes(block.module));

  return {
    data: data,
    page: 0,
    pageSize: data.length,
    total: data.length,
  };
}

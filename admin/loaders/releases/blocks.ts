import { AppContext, BlockMetadata } from "../../mod.ts";
import { Pagination } from "../../types.ts";

export interface Props {
  site: string;
}

export default async function ListBlocks(
  _props: Props,
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

  const data = Object.entries(state).map(([id, blockState]) => ({
    id,
    ...(blockState as Omit<BlockMetadata, "id">),
  }));

  return {
    data: data,
    page: 0,
    pageSize: data.length,
    total: data.length,
  };
}

import { AppContext, BlockState } from "../../mod.ts";
import { Pagination } from "../../types.ts";

export interface Props {
  site: string;
  blockId: string;
}

export default async function ListRevisions(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Pagination<BlockState>> {
  const block = await ctx.invoke["deco-sites/admin"].loaders.blocks.latest(
    props,
  );
  if (!block) {
    return {
      data: [],
      page: 0,
      pageSize: 0,
      total: 0,
    };
  }

  return {
    data: [block],
    page: 0,
    pageSize: 1,
    total: 1,
  };
}

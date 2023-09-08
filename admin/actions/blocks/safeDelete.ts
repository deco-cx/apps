import { AppContext } from "../../mod.ts";

export interface Props {
  blockId: string;
}

export default async function NewRevision(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  await ctx.invoke["deco-sites/admin"].actions.blocks.delete(props);
}

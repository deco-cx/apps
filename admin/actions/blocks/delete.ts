import { AppContext } from "../../mod.ts";

export interface Props {
  blockId: string;
}

export default async function NewRevision(
  { blockId }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  await ctx.storage.delete(blockId);
}

import { AppContext } from "../../mod.ts";

export interface Props {
  blockId: string;
  site: string;
}

export default async function Delete(
  { blockId, site }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  await ctx.storage.patchDecofile(site, (decofile) => {
    delete decofile[blockId];
    return Promise.resolve();
  }, `Delete block ${blockId}`);
}

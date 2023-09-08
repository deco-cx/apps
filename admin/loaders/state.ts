import { Resolvable } from "deco/engine/core/resolver.ts";
import { AppContext } from "../mod.ts";

export interface Props {
  site: string;
  blockId: string;
}

export default async function Latest(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Record<string, Resolvable>> {
  return await ctx.storage.state();
}

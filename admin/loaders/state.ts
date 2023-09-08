import { AppContext } from "../mod.ts";

export interface Props {
  site: string;
  blockId: string;
}

export type State = Record<string, any>;

export default async function Latest(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<State> {
  return await ctx.storage.state();
}

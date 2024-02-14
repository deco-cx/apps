import { AppContext } from "../mod.ts";

export interface Props {
  site: string;
}

// deno-lint-ignore no-explicit-any
export type State = Record<string, any>;

export default async function Latest(
  { site }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<State> {
  const repo = await ctx.storage.getRepository(site);
  const stash = repo.workingTree();

  return stash.state();
}

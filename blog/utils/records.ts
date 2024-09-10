import type { Resolvable } from "@deco/deco";
import type { AppContext } from "../mod.ts";

export async function getRecordsByPath<T>(
  ctx: AppContext,
  path: string,
  accessor: string,
): Promise<T[]> {
  const resolvables: Record<string, Resolvable<T>> = await ctx.get({
    __resolveType: "resolvables",
  });

  const current = Object.entries(resolvables).flatMap(([key, value]) => {
    return key.startsWith(path) ? value : [];
  });

  return (current as Record<string, T>[]).map((item) => item[accessor]);
}

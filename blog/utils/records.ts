import { AppContext } from "../mod.ts";
import { Resolvable } from "deco/engine/core/resolver.ts";

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

  return (current as Record<string, T>[]).map((item) => {
    const name = (item.name as string).split(path)[1]?.replace("/", "");
    return {
      ...item[accessor],
      name,
    };
  });
}

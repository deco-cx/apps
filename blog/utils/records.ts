import { AppContext } from "../mod.ts";

export async function getRecordsByPath<T>(
  ctx: AppContext,
  path: string,
  accessor: string,
): Promise<T[]> {
  const resolvables = await ctx.get({
    __resolveType: "resolvables",
  });

  const pathParts = path.split("/");

  let current = resolvables;
  for (const part of pathParts) {
    if (current[part] === undefined) {
      return [];
    }
    current = current[part];
  }

  return (Object.values(current) as Record<string, T>[]).map(
    (item) => item[accessor],
  );
}

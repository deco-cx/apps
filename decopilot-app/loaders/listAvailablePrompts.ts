import { AppContext } from "../mod.ts";
// import { Prompt } from "../types.ts";

/**
 * @title Decopilot App - Get Saved Prompt
 * @description Retrieves a saved prompt from app array
 */
import { allowCorsFor } from "@deco/deco";

interface Props {
  term?: string;
}

export default function ProductsLoader(
  _props: Props,
  req: Request,
  ctx: AppContext,
) {
  // Allow Cors
  Object.entries(allowCorsFor(req)).map(([name, value]) => {
    ctx.response.headers.set(name, value);
  });

  // fetch X api
  const foundPrompt = ctx.content.map(({ name }) => name);

  return foundPrompt;

  //TODO Add prompts to resolvables like blog
  //   export async function getRecordsByPath<T>(
  //     ctx: AppContext,
  //     path: string,
  //     accessor: string,
  //   ): Promise<T[]> {
  //     const resolvables: Record<string, Resolvable<T>> = await ctx.get({
  //       __resolveType: "resolvables",
  //     });

  //     const current = Object.entries(resolvables).flatMap(([key, value]) => {
  //       return key.startsWith(path) ? value : [];
  //     });

  //     return (current as Record<string, T>[]).map((item) => item[accessor]);
  //   }
}

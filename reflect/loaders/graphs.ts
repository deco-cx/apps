import type { AppContext } from "../mod.ts";
import type { Graph } from "../client.ts";

/**
 * @name GetGraphs
 * @title Get Graphs
 * @description Fetches all graphs available to the authenticated user.
 */
export default async function getGraphs(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Graph[]> {
  return await ctx.reflect.getGraphs();
}

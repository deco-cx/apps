import type { AppContext } from "../../mod.ts";
import type { Link } from "../../client.ts";

export interface Props {
  /**
   * @title Graph ID
   * @description ID of the graph to get links from
   */
  graphId: string;
}

/**
 * @name GetLinks
 * @title Get Links
 * @description Fetches all links from a specific graph.
 */
export default async function getLinks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Link[]> {
  return await ctx.reflect.getLinks(props.graphId);
}

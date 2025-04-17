import type { AppContext } from "../../mod.ts";
import type { Link } from "../../client.ts";

export interface Props {
  /**
   * @title Graph ID
   * @description ID of the graph to create the link in
   */
  graphId: string;

  /**
   * @title URL
   * @description URL of the link
   */
  url: string;

  /**
   * @title Title
   * @description Title of the link
   */
  title?: string;

  /**
   * @title Description
   * @description Description of the link
   */
  description?: string;

  /**
   * @title Highlights
   * @description Array of highlights from the link
   */
  highlights?: string[];
}

/**
 * @name CreateLink
 * @title Create Link
 * @description Creates a new link in a specific graph.
 */
export default async function createLink(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Link> {
  const { graphId, ...linkData } = props;

  return await ctx.reflect.createLink(graphId, linkData);
}

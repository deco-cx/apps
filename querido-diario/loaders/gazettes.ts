import { AppContext } from "../mod.ts";
import { Gazette } from "../client.ts";

export interface Props {
  /**
   * @description Search query.
   */
  q?: string;
  /**
   * @description Filter by territory IDs.
   */
  territory_ids?: string[];
  /**
   * @description Filter by start date (YYYY-MM-DD).
   * @format date
   */
  published_since?: string;
  /**
   * @description Filter by end date (YYYY-MM-DD).
   * @format date
   */
  published_until?: string;
  /**
   * @description Number of results to return.
   */
  size?: number;
  /**
   * @description Offset of results.
   */
  offset?: number;
  /**
   * @description Sort by.
   */
  sort_by?: "relevance" | "descending_date" | "ascending_date";
  /**
   * @description The size of the excerpt of the gazette.
   */
  excerpt_size?: number;
  /**
   * @description The number of excerpts to return.
   */
  number_of_excerpts?: number;
  /**
   * @description The pre-tags for the excerpt.
   */
  pre_tags?: string;
  /**
   * @description The post-tags for the excerpt.
   */
  post_tags?: string;
}

/**
 * @title Search Gazettes
 * @description Search for official government gazettes in Brazil.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ total_gazettes: number; gazettes: Gazette[] }> => {
  console.log("Searching gazettes with props:", props);

  const response = await ctx.api["GET /gazettes"]({
    ...props,
    querystring: props.q,
  });

  const data = await response.json();

  console.log("Received data:", data);

  return data;
};

export default loader;

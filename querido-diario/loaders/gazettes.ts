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
   * @description Filter by start date.
   * @format date
   */
  since?: string;
  /**
   * @description Filter by end date.
   * @format date
   */
  until?: string;
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
  const response = await ctx.api["GET /gazettes"]({
    querystring: props.q,
    territory_ids: props.territory_ids,
    published_since: props.since,
    published_until: props.until,
    size: props.size,
    offset: props.offset,
    sort_by: props.sort_by,
  });

  const data = await response.json();

  return data;
};

export default loader;

import { AppContext } from "../mod.ts";
import { NotionPage } from "../utils/types.ts";

interface Props {
  /**
   * @title Database ID
   * @description The ID of the Notion database to query
   */
  database_id: string;

  /**
   * @title Filter
   * @description Filter conditions for the database query
   */
  filter?: unknown;

  /**
   * @title Sorts
   * @description Sort conditions for the database query
   */
  sorts?: unknown[];

  /**
   * @title Page Size
   * @description Number of results to return (max 100)
   */
  page_size?: number;

  /**
   * @title Start Cursor
   * @description Cursor for pagination
   */
  start_cursor?: string;
}

/**
 * @title Query Notion Database
 * @description Query a Notion database with filters and sorting
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  object: "list";
  results: NotionPage[];
  next_cursor?: string;
  has_more: boolean;
  type: "page";
  page: Record<PropertyKey, never>;
}> => {
  const { database_id, ...body } = props;

  const response = await ctx.api[`POST /v1/databases/:database_id/query`]({
    database_id,
  }, { body });

  const result = await response.json();

  return result;
};

export default loader;

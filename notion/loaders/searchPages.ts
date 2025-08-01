import { AppContext } from "../mod.ts";
import { NotionSearchResult } from "../utils/types.ts";

interface Props {
  /**
   * @title Query
   * @description Search query string (optional - leave empty to get all pages)
   */
  query?: string;

  /**
   * @title Filter Object Type
   * @description Filter by object type (optional)
   */
  filter_object_type?: "page" | "database";

  /**
   * @title Sort Direction
   * @description Sort results by last edited time (optional)
   */
  sort_direction?: "ascending" | "descending";

  /**
   * @title Page Size
   * @description Number of results to return (max 100, default 10)
   */
  page_size?: number;

  /**
   * @title Start Cursor
   * @description Cursor for pagination (optional)
   */
  start_cursor?: string;
}

/**
 * @title Search Notion Pages
 * @description Search for pages and databases in your Notion workspace
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<NotionSearchResult> => {
  // Build the search body dynamically, only including non-empty fields
  const body: {
    query?: string;
    filter?: { value: "page" | "database"; property: "object" };
    sort?: {
      direction: "ascending" | "descending";
      timestamp: "last_edited_time";
    };
    page_size?: number;
    start_cursor?: string;
  } = {};

  if (props.query) {
    body.query = props.query;
  }

  if (props.filter_object_type) {
    body.filter = {
      value: props.filter_object_type,
      property: "object",
    };
  }

  if (props.sort_direction) {
    body.sort = {
      direction: props.sort_direction,
      timestamp: "last_edited_time",
    };
  }

  if (props.page_size) {
    body.page_size = props.page_size;
  }

  if (props.start_cursor) {
    body.start_cursor = props.start_cursor;
  }

  const response = await ctx.api[`POST /search`]({}, { body });

  const result = await response.json();

  return result;
};

export default loader;

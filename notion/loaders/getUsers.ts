import { AppContext } from "../mod.ts";
import { NotionUser } from "../utils/types.ts";

interface Props {
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
 * @title Get Notion Users
 * @description Get all users in the Notion workspace
 */
const loader = async (
  _props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  object: "list";
  results: NotionUser[];
  next_cursor?: string;
  has_more: boolean;
  type: "user";
  user: Record<PropertyKey, never>;
}> => {
  const response = await ctx.api[`GET /users`]({});

  const result = await response.json();

  return result;
};

export default loader;

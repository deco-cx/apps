import { AppContext } from "../mod.ts";
import { NotionDatabase } from "../utils/types.ts";

interface Props {
  /**
   * @title Database ID
   * @description The ID of the Notion database to retrieve
   */
  database_id: string;
}

/**
 * @title Get Notion Database
 * @description Retrieve a specific Notion database by its ID
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<NotionDatabase> => {
  const response = await ctx.api[`GET /v1/databases/:database_id`]({
    database_id: props.database_id,
  });

  const result = await response.json();

  return result;
};

export default loader;

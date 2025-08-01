import { AppContext } from "../mod.ts";
import { NotionDatabase, RichText } from "../utils/types.ts";

interface Props {
  /**
   * @title Database ID
   * @description The ID of the database to update
   */
  database_id: string;

  /**
   * @title Title
   * @description Database title
   */
  title?: RichText[];

  /**
   * @title Description
   * @description Database description
   */
  description?: RichText[];

  /**
   * @title Properties
   * @description Database properties to update
   */
  properties?: Record<string, unknown>;

  /**
   * @title Icon
   * @description Database icon (emoji, external URL, or file)
   */
  icon?: {
    type: "emoji" | "external" | "file";
    emoji?: string;
    external?: { url: string };
    file?: { url: string };
  };

  /**
   * @title Cover
   * @description Database cover image
   */
  cover?: {
    type: "external" | "file";
    external?: { url: string };
    file?: { url: string };
  };

  /**
   * @title Archived
   * @description Whether the database is archived
   */
  archived?: boolean;
}

/**
 * @title Update Notion Database
 * @description Update an existing Notion database
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<NotionDatabase> => {
  const { database_id, ...body } = props;

  const response = await ctx.api[`PATCH /v1/databases/:database_id`]({
    database_id,
  }, { body });

  const result = await response.json();

  return result;
};

export default action;

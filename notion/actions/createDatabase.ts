import { AppContext } from "../mod.ts";
import { NotionDatabase, RichText } from "../utils/types.ts";

interface Props {
  /**
   * @title Parent Page ID
   * @description The ID of the parent page where the database will be created
   */
  parent_page_id: string;

  /**
   * @title Title
   * @description Database title
   */
  title: RichText[];

  /**
   * @title Properties
   * @description Database properties schema
   */
  properties: Record<string, unknown>;

  /**
   * @title Description
   * @description Database description
   */
  description?: RichText[];

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
   * @title Is Inline
   * @description Whether the database is inline
   */
  is_inline?: boolean;
}

/**
 * @title Create Notion Database
 * @description Create a new database in Notion
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<NotionDatabase> => {
  const { parent_page_id, ...rest } = props;

  const body = {
    ...rest,
    parent: {
      type: "page_id" as const,
      page_id: parent_page_id,
    },
  };

  const response = await ctx.api[`POST /v1/databases`]({}, { body });

  const result = await response.json();

  return result;
};

export default action;

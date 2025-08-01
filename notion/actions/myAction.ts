import { AppContext } from "../mod.ts";
import { NotionPage } from "../utils/types.ts";

interface Props {
  /**
   * @title Parent
   * @description Where to create the page (database_id or page_id)
   */
  parent: {
    database_id?: string;
    page_id?: string;
    type?: "database_id" | "page_id";
  };

  /**
   * @title Properties
   * @description Page properties (title, content, etc.)
   */
  properties: Record<string, unknown>;

  /**
   * @title Icon
   * @description Page icon (emoji, external URL, or file)
   */
  icon?: {
    type: "emoji" | "external" | "file";
    emoji?: string;
    external?: { url: string };
    file?: { url: string };
  };

  /**
   * @title Cover
   * @description Page cover image
   */
  cover?: {
    type: "external" | "file";
    external?: { url: string };
    file?: { url: string };
  };
}

/**
 * @title Create Notion Page
 * @description Create a new page in Notion
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<NotionPage> => {
  const response = await ctx.api[`POST /v1/pages`]({}, { body: props });

  const result = await response.json();

  return result;
};

export default action;

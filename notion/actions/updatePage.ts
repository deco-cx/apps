import { AppContext } from "../mod.ts";
import { NotionPage } from "../utils/types.ts";

interface Props {
  /**
   * @title Page ID
   * @description The ID of the page to update
   */
  page_id: string;

  /**
   * @title Properties
   * @description Page properties to update
   */
  properties?: Record<string, unknown>;

  /**
   * @title Archived
   * @description Whether the page is archived
   */
  archived?: boolean;

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
 * @title Update Notion Page
 * @description Update an existing Notion page
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<NotionPage> => {
  const { page_id, ...body } = props;

  const response = await ctx.api[`PATCH /v1/pages/:page_id`]({
    page_id,
  }, { body });

  const result = await response.json();

  return result;
};

export default action;

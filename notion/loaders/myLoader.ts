import { AppContext } from "../mod.ts";
import { NotionPage } from "../utils/types.ts";

interface Props {
  /**
   * @title Page ID
   * @description The ID of the Notion page to retrieve
   */
  page_id: string;
}

/**
 * @title Get Notion Page
 * @description Retrieve a specific Notion page by its ID
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<NotionPage> => {
  const response = await ctx.api[`GET /v1/pages/:page_id`]({
    page_id: props.page_id,
  });

  const result = await response.json();

  return result;
};

export default loader;

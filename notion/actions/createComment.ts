import { AppContext } from "../mod.ts";
import { NotionComment, RichText } from "../utils/types.ts";

interface Props {
  /**
   * @title Parent
   * @description The parent page or block to comment on
   */
  parent: {
    page_id?: string;
    block_id?: string;
  };

  /**
   * @title Rich Text
   * @description The comment content as rich text
   */
  rich_text: RichText[];
}

/**
 * @title Create Notion Comment
 * @description Create a comment on a page or block
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<NotionComment> => {
  const response = await ctx.api[`POST /v1/comments`]({}, { body: props });

  const result = await response.json();

  return result;
};

export default action;

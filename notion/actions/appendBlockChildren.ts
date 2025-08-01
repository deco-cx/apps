import { AppContext } from "../mod.ts";
import { NotionBlock } from "../utils/types.ts";

interface Props {
  /**
   * @title Block ID
   * @description The ID of the block to append children to
   */
  block_id: string;

  /**
   * @title Children
   * @description Array of child blocks to append
   */
  children: NotionBlock[];

  /**
   * @title After
   * @description ID of the existing child to append after
   */
  after?: string;
}

/**
 * @title Append Block Children
 * @description Append child blocks to a parent block
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  object: "list";
  results: NotionBlock[];
  next_cursor?: string;
  has_more: boolean;
  type: "block";
  block: Record<PropertyKey, never>;
}> => {
  const { block_id, ...body } = props;

  const response = await ctx.api[`PATCH /v1/blocks/:block_id/children`]({
    block_id,
  }, { body });

  const result = await response.json();

  return result;
};

export default action;

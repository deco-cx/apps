import { AppContext } from "../mod.ts";
import { NotionBlock } from "../utils/types.ts";

interface Props {
  /**
   * @title Block ID
   * @description The ID of the block to get children from
   */
  block_id: string;

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
 * @title Get Block Children
 * @description Get the children blocks of a specific block
 */
const loader = async (
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
  const { block_id } = props;

  const response = await ctx.api[`GET /v1/blocks/:block_id/children`]({
    block_id,
  });

  const result = await response.json();

  return result;
};

export default loader;

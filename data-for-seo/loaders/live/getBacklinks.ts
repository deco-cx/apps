import { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Target
   * @description Target domain or URL to retrieve backlinks for
   */
  target: string;

  /**
   * @title Limit
   * @description Maximum number of backlinks to return
   */
  limit?: number;

  /**
   * @title Offset
   * @description Starting position for pagination
   */
  offset?: number;

  /**
   * @title Order By
   * @description Sort order (e.g., "rank desc", "backlinks desc")
   */
  order_by?: string;
}

/**
 * @name BACKLINKS_BACKLINKS_LIVE
 * @title Get Backlinks List
 * @description Get a detailed list of backlinks for a domain or URL
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["POST /backlinks/backlinks/live"](
    {},
    {
      body: [{
        target: props.target,
        limit: props.limit,
        offset: props.offset,
        order_by: props.order_by ? [props.order_by] : undefined,
      }],
    },
  );
  return await handleDataForSeoResponse(response, "Backlinks List");
}

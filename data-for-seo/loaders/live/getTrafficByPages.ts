import { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Target
   * @description Domain to analyze traffic by pages
   */
  target: string;

  /**
   * @title Limit
   * @description Maximum number of pages to return
   */
  limit?: number;

  /**
   * @title Offset
   * @description Offset for pagination
   */
  offset?: number;
}

/**
 * @name TRAFFIC_ANALYTICS_BY_PAGES_LIVE
 * @title Get Traffic By Pages
 * @description Get website traffic data broken down by pages
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["POST /traffic_analytics/by_pages/live"](
    {},
    {
      body: [{
        target: props.target,
        limit: props.limit,
        offset: props.offset,
      }],
    },
  );
  return await handleDataForSeoResponse(response, "Traffic By Pages");
}

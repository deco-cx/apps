import { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Target
   * @description Domain to analyze traffic sources
   */
  target: string;
}

/**
 * @name TRAFFIC_ANALYTICS_BY_SOURCE_LIVE
 * @title Get Traffic By Sources
 * @description Get website traffic data broken down by traffic sources
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["POST /traffic_analytics/by_source/live"](
    {},
    {
      body: [{
        target: props.target,
      }],
    },
  );
  return await handleDataForSeoResponse(response, "Traffic By Sources");
}

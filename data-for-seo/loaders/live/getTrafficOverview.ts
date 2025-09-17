import { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Target
   * @description Domain to analyze traffic
   */
  target: string;
}

/**
 * @name TRAFFIC_ANALYTICS_OVERVIEW
 * @title Get Traffic Analytics Overview
 * @description Get website traffic overview metrics
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["POST /traffic_analytics/overview/live"](
    {},
    {
      body: [{
        target: props.target,
      }],
    },
  );
  return await handleDataForSeoResponse(response, "Traffic Analytics Overview");
}

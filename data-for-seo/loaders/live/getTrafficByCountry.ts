import { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Target
   * @description Domain to analyze traffic by country
   */
  target: string;
}

/**
 * @name TRAFFIC_ANALYTICS_BY_COUNTRY_LIVE
 * @title Get Traffic By Country
 * @description Get website traffic data broken down by countries
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["POST /traffic_analytics/by_country/live"](
    {},
    {
      body: [{
        target: props.target,
      }],
    },
  );
  return await handleDataForSeoResponse(response, "Traffic By Country");
}

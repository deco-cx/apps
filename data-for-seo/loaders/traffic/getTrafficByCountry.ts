import { AppContext } from "../../mod.ts";
import { DataForSeoTaskResponse, TrafficByCountry } from "../../client.ts";

export interface Props {
  /**
   * @title Target
   * @description Domain to analyze traffic by country
   */
  target: string;

  /**
   * @title Limit
   * @description Maximum number of countries to return
   * @default 50
   */
  limit?: number;

  /**
   * @title Offset
   * @description Offset for pagination
   * @default 0
   */
  offset?: number;
}

/**
 * @title DataForSEO - Traffic by Country
 * @description Get traffic distribution by country for a domain
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TrafficByCountry[]> => {
  const { target, limit = 50, offset = 0 } = props;

  const response = await ctx.client["POST /traffic_analytics/by_country/live"](
    {},
    {
      body: [{
        target,
        limit,
        offset,
      }],
    },
  );

  const data = await response.json() as DataForSeoTaskResponse;

  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO API Error: ${data.status_message}`);
  }

  if (data.tasks?.[0]?.result?.[0]) {
    const result = data.tasks[0].result[0] as { items?: TrafficByCountry[] };
    return result.items || [];
  }

  return [];
};

export default loader;

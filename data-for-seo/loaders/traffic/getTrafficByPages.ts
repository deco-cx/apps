import { AppContext } from "../../mod.ts";
import { DataForSeoTaskResponse, TrafficByPage } from "../../client.ts";

export interface Props {
  /**
   * @title Target
   * @description Domain to analyze traffic by pages
   */
  target: string;

  /**
   * @title Limit
   * @description Maximum number of pages to return
   * @default 100
   */
  limit?: number;

  /**
   * @title Offset
   * @description Offset for pagination
   * @default 0
   */
  offset?: number;

  /**
   * @title Order By
   * @description Sort results by specific metric
   * @enum ["visits desc", "visits asc", "bounce_rate desc", "bounce_rate asc", "avg_time_on_page desc", "avg_time_on_page asc"]
   */
  orderBy?: string;

  /**
   * @title Min Visits
   * @description Filter pages by minimum visits
   * @default 0
   */
  minVisits?: number;
}

/**
 * @title DataForSEO - Traffic by Pages
 * @description Get traffic metrics for individual pages of a domain
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TrafficByPage[]> => {
  const { target, limit = 100, offset = 0, orderBy, minVisits = 0 } = props;

  const filters = minVisits > 0 ? [`visits,>,${minVisits}`] : undefined;
  const order_by = orderBy ? [orderBy] : undefined;

  const response = await ctx.client["POST /traffic_analytics/by_pages/live"](
    {},
    {
      body: [{
        target,
        limit,
        offset,
        filters,
        order_by,
      }],
    },
  );

  const data = await response.json() as DataForSeoTaskResponse;

  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO API Error: ${data.status_message}`);
  }

  if (data.tasks?.[0]?.result?.[0]) {
    const result = data.tasks[0].result[0] as { items?: TrafficByPage[] };
    return result.items || [];
  }

  return [];
};

export default loader;

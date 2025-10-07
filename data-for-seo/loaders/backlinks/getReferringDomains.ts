import { AppContext } from "../../mod.ts";
import { DataForSeoTaskResponse, ReferringDomain } from "../../client.ts";

export interface Props {
  /**
   * @title Target
   * @description Domain or URL to analyze referring domains
   */
  target: string;

  /**
   * @title Limit
   * @description Maximum number of domains to return
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
   * @enum ["rank desc", "rank asc", "backlinks desc", "backlinks asc", "first_seen desc", "first_seen asc"]
   */
  orderBy?: string;

  /**
   * @title Filter by Quality
   * @description Filter by minimum domain rank (0-1000)
   * @default 0
   */
  minRank?: number;
}

/**
 * @title DataForSEO - Referring Domains
 * @description Get list of domains linking to the target with detailed metrics
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ReferringDomain[]> => {
  const { target, limit = 100, offset = 0, orderBy, minRank = 0 } = props;

  const filters = minRank > 0 ? [`rank,>,${minRank}`] : undefined;
  const order_by = orderBy ? [orderBy] : undefined;

  const response = await ctx.client["POST /backlinks/referring_domains/live"](
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
    const result = data.tasks[0].result[0] as { items?: ReferringDomain[] };
    return result.items || [];
  }

  return [];
};

export default loader;

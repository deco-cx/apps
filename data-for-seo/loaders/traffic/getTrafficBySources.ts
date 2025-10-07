import { AppContext } from "../../mod.ts";
import type { DataForSeoTaskResponse, TrafficBySource } from "../../client.ts";

interface Props {
  /**
   * @title Target
   * @description Domain to analyze traffic sources
   */
  target: string;
}

/**
 * @title Get Traffic by Sources
 * @description Get traffic breakdown by source (direct, organic, paid, referral, social)
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TrafficBySource> {
  const { target } = props;

  if (!target) {
    throw new Error("Target domain is required");
  }

  const response = await ctx.client["POST /traffic_analytics/by_source/live"](
    {},
    {
      body: [{
        target,
      }],
    },
  );

  const data = await response.json() as DataForSeoTaskResponse;

  if (data.status_code !== 20000 || !data.tasks?.[0]?.result?.[0]) {
    throw new Error(
      data.status_message || "Failed to fetch traffic by sources",
    );
  }

  const result = data.tasks[0].result[0] as {
    direct?: number;
    search_organic?: number;
    search_paid?: number;
    referral?: number;
    social?: number;
    mail?: number;
    display_ad?: number;
  };

  return {
    direct: result.direct || 0,
    search_organic: result.search_organic || 0,
    search_paid: result.search_paid || 0,
    referral: result.referral || 0,
    social: result.social || 0,
    mail: result.mail || 0,
    display_ad: result.display_ad || 0,
  };
}

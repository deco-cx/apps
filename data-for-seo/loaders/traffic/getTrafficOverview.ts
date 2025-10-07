import { AppContext } from "../../mod.ts";
import type { DataForSeoTaskResponse, TrafficOverview } from "../../client.ts";

interface Props {
  /**
   * @title Target
   * @description Domain to analyze traffic
   */
  target: string;
}

/**
 * @title Get Traffic Overview
 * @description Get website traffic overview metrics
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TrafficOverview> {
  const { target } = props;

  if (!target) {
    throw new Error("Target domain is required");
  }

  const response = await ctx.client["POST /traffic_analytics/overview/live"](
    {},
    {
      body: [{
        target,
      }],
    },
  );

  const data = await response.json() as DataForSeoTaskResponse;

  if (data.status_code !== 20000 || !data.tasks?.[0]?.result?.[0]) {
    throw new Error(data.status_message || "Failed to fetch traffic overview");
  }

  const result = data.tasks[0].result[0] as {
    target: string;
    date?: string;
    rank?: number;
    visits?: number;
    unique_visitors?: number;
    pages_per_visit?: number;
    avg_visit_duration?: number;
    bounce_rate?: number;
    users_expected_visits_rate?: number;
  };

  return {
    target: result.target,
    date: result.date || new Date().toISOString(),
    rank: result.rank || 0,
    visits: result.visits || 0,
    unique_visitors: result.unique_visitors || 0,
    pages_per_visit: result.pages_per_visit || 0,
    avg_visit_duration: result.avg_visit_duration || 0,
    bounce_rate: result.bounce_rate || 0,
    users_expected_visits_rate: result.users_expected_visits_rate || 0,
  };
}

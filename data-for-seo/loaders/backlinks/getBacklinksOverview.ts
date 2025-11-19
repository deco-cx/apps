import { AppContext } from "../../mod.ts";
import type {
  BacklinksOverview,
  DataForSeoTaskResponse,
} from "../../client.ts";

interface Props {
  /**
   * @title Target
   * @description Target domain or URL to analyze
   */
  target: string;
}

/**
 * @title Get Backlinks Overview
 * @description Get an overview of backlinks data for a domain
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BacklinksOverview> {
  const { target } = props;

  if (!target) {
    throw new Error("Target domain or URL is required");
  }

  const response = await ctx.client["POST /backlinks/domain_info/live"](
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
      data.status_message || "Failed to fetch backlinks overview",
    );
  }

  const result = data.tasks[0].result[0] as {
    target: string;
    total_backlinks?: number;
    total_pages?: number;
    total_domains?: number;
    broken_backlinks?: number;
    broken_pages?: number;
    referring_domains?: number;
    referring_main_domains?: number;
    referring_ips?: number;
    referring_subnets?: number;
    referring_pages?: number;
    dofollow?: number;
    nofollow?: number;
    gov_domains?: number;
    edu_domains?: number;
    rank?: number;
    main_domain_rank?: number;
    last_updated_time?: string;
  };

  return {
    target: result.target,
    total_backlinks: result.total_backlinks || 0,
    total_pages: result.total_pages || 0,
    total_domains: result.total_domains || 0,
    broken_backlinks: result.broken_backlinks || 0,
    broken_pages: result.broken_pages || 0,
    referring_domains: result.referring_domains || 0,
    referring_main_domains: result.referring_main_domains || 0,
    referring_ips: result.referring_ips || 0,
    referring_subnets: result.referring_subnets || 0,
    referring_pages: result.referring_pages || 0,
    dofollow: result.dofollow || 0,
    nofollow: result.nofollow || 0,
    gov_domains: result.gov_domains || 0,
    edu_domains: result.edu_domains || 0,
    rank: result.rank || 0,
    main_domain_rank: result.main_domain_rank || 0,
    last_updated_time: result.last_updated_time || new Date().toISOString(),
  };
}

import { AppContext } from "../mod.ts";
import type {
  BacklinksOverview,
  DataForSeoTaskResponse,
  TrafficOverview,
} from "../client.ts";

interface Props {
  /**
   * @title Domains
   * @description List of domains to compare (2-5 domains)
   */
  domains: string[];
}

export interface DomainComparison {
  domain: string;
  traffic: {
    visits: number;
    unique_visitors: number;
    bounce_rate: number;
    pages_per_visit: number;
    avg_visit_duration: number;
  };
  backlinks: {
    total_backlinks: number;
    referring_domains: number;
    dofollow_percentage: number;
    domain_rank: number;
  };
  performance_score: number;
}

export interface ComparisonResult {
  domains: DomainComparison[];
  winner: {
    traffic: string;
    backlinks: string;
    overall: string;
  };
  insights: string[];
}

/**
 * @title Compare Domain Metrics
 * @description Compare traffic and backlink metrics between multiple domains
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ComparisonResult> {
  const { domains } = props;

  if (!domains || domains.length < 2) {
    throw new Error("Please provide at least 2 domains to compare");
  }

  if (domains.length > 5) {
    throw new Error("Maximum 5 domains allowed for comparison");
  }

  // Fetch traffic and backlinks data for all domains
  const domainData: DomainComparison[] = [];

  for (const domain of domains) {
    try {
      // Get traffic data
      const trafficResponse = await ctx.client
        ["POST /traffic_analytics/overview/live"](
          {},
          {
            body: [{ target: domain }],
          },
        );
      const trafficData = await trafficResponse
        .json() as DataForSeoTaskResponse;
      const traffic = trafficData.tasks?.[0]?.result?.[0] as TrafficOverview ||
        {
          visits: 0,
          unique_visitors: 0,
          bounce_rate: 0,
          pages_per_visit: 0,
          avg_visit_duration: 0,
        };

      // Get backlinks data
      const backlinksResponse = await ctx.client
        ["POST /backlinks/domain_info/live"](
          {},
          {
            body: [{ target: domain }],
          },
        );
      const backlinksData = await backlinksResponse
        .json() as DataForSeoTaskResponse;
      const backlinks =
        backlinksData.tasks?.[0]?.result?.[0] as BacklinksOverview || {
          total_backlinks: 0,
          referring_domains: 0,
          dofollow: 0,
          nofollow: 0,
          rank: 0,
        };

      // Calculate performance score
      let performanceScore = 0;

      // Traffic metrics (50%)
      if (traffic.visits > 0) {
        performanceScore += Math.min(traffic.visits / 100000, 1) * 20; // Visits score
        performanceScore += Math.min(traffic.pages_per_visit / 5, 1) * 10; // Engagement
        performanceScore += Math.max(1 - traffic.bounce_rate / 100, 0) * 10; // Low bounce rate
        performanceScore += Math.min(traffic.avg_visit_duration / 300, 1) * 10; // Time on site
      }

      // Backlink metrics (50%)
      if (backlinks.total_backlinks > 0) {
        performanceScore += Math.min(backlinks.referring_domains / 1000, 1) *
          20; // Domain diversity
        const dofollow_percentage = backlinks.dofollow /
          backlinks.total_backlinks;
        performanceScore += dofollow_percentage * 15; // Quality links
        performanceScore += Math.min(backlinks.rank / 100, 1) * 15; // Domain rank
      }

      domainData.push({
        domain,
        traffic: {
          visits: traffic.visits || 0,
          unique_visitors: traffic.unique_visitors || 0,
          bounce_rate: traffic.bounce_rate || 0,
          pages_per_visit: traffic.pages_per_visit || 0,
          avg_visit_duration: traffic.avg_visit_duration || 0,
        },
        backlinks: {
          total_backlinks: backlinks.total_backlinks || 0,
          referring_domains: backlinks.referring_domains || 0,
          dofollow_percentage: backlinks.total_backlinks > 0
            ? (backlinks.dofollow / backlinks.total_backlinks) * 100
            : 0,
          domain_rank: backlinks.rank || 0,
        },
        performance_score: Math.round(performanceScore),
      });
    } catch (error) {
      console.error(`Error fetching data for ${domain}:`, error);
      domainData.push({
        domain,
        traffic: {
          visits: 0,
          unique_visitors: 0,
          bounce_rate: 0,
          pages_per_visit: 0,
          avg_visit_duration: 0,
        },
        backlinks: {
          total_backlinks: 0,
          referring_domains: 0,
          dofollow_percentage: 0,
          domain_rank: 0,
        },
        performance_score: 0,
      });
    }
  }

  // Determine winners
  const trafficWinner =
    domainData.reduce((a, b) => a.traffic.visits > b.traffic.visits ? a : b)
      .domain;

  const backlinksWinner =
    domainData.reduce((a, b) =>
      a.backlinks.referring_domains > b.backlinks.referring_domains ? a : b
    ).domain;

  const overallWinner =
    domainData.reduce((a, b) =>
      a.performance_score > b.performance_score ? a : b
    ).domain;

  // Generate insights
  const insights: string[] = [];

  // Traffic insights
  const avgTraffic = domainData.reduce((sum, d) => sum + d.traffic.visits, 0) /
    domainData.length;
  const highTrafficDomains = domainData.filter((d) =>
    d.traffic.visits > avgTraffic * 2
  );
  if (highTrafficDomains.length > 0) {
    insights.push(
      `${
        highTrafficDomains.map((d) => d.domain).join(", ")
      } have significantly higher traffic than average`,
    );
  }

  // Engagement insights
  const bestEngagement = domainData.reduce((a, b) =>
    a.traffic.pages_per_visit > b.traffic.pages_per_visit ? a : b
  );
  if (bestEngagement.traffic.pages_per_visit > 3) {
    insights.push(
      `${bestEngagement.domain} has excellent user engagement with ${
        bestEngagement.traffic.pages_per_visit.toFixed(1)
      } pages per visit`,
    );
  }

  // Backlink insights
  const avgReferringDomains =
    domainData.reduce((sum, d) => sum + d.backlinks.referring_domains, 0) /
    domainData.length;
  const strongBacklinkProfiles = domainData.filter((d) =>
    d.backlinks.referring_domains > avgReferringDomains * 2
  );
  if (strongBacklinkProfiles.length > 0) {
    insights.push(
      `${
        strongBacklinkProfiles.map((d) => d.domain).join(", ")
      } have strong backlink profiles`,
    );
  }

  // Quality insights
  const highQualityDomains = domainData.filter((d) =>
    d.backlinks.dofollow_percentage > 70
  );
  if (highQualityDomains.length > 0) {
    insights.push(
      `${
        highQualityDomains.map((d) => d.domain).join(", ")
      } have high-quality backlink profiles (>70% dofollow)`,
    );
  }

  // Weakness insights
  const weakDomains = domainData.filter((d) => d.performance_score < 30);
  if (weakDomains.length > 0) {
    insights.push(
      `${
        weakDomains.map((d) => d.domain).join(", ")
      } need significant improvements in both traffic and backlinks`,
    );
  }

  return {
    domains: domainData.sort((a, b) =>
      b.performance_score - a.performance_score
    ),
    winner: {
      traffic: trafficWinner,
      backlinks: backlinksWinner,
      overall: overallWinner,
    },
    insights,
  };
}

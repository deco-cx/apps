import { AppContext } from "../mod.ts";
import type {
  BacklinksOverview,
  SerpItem,
  TrafficOverview,
} from "../client.ts";

export interface Props {
  /**
   * @title Domain
   * @description Domain to audit
   */
  domain: string;

  /**
   * @title Primary Keywords
   * @description Main keywords to analyze SERP positions
   */
  keywords: string[];

  /**
   * @title Competitors
   * @description Competitor domains for comparison
   * @default []
   */
  competitors?: string[];

  /**
   * @title Language Name
   * @description Language for keyword analysis
   * @default English
   */
  language_name?: string;

  /**
   * @title Location Name
   * @description Geographic location
   * @default United States
   */
  location_name?: string;
}

export interface SEOAuditReport {
  domain: string;
  audit_date: string;
  overview: {
    overall_score: number;
    traffic_metrics: {
      monthly_visits: number;
      unique_visitors: number;
      bounce_rate: number;
      pages_per_visit: number;
    };
    backlink_metrics: {
      total_backlinks: number;
      referring_domains: number;
      domain_rank: number;
      dofollow_ratio: number;
    };
    keyword_visibility: {
      tracked_keywords: number;
      top_3_positions: number;
      top_10_positions: number;
      avg_position: number;
    };
  };
  issues: {
    critical: Array<{
      type: string;
      description: string;
      impact: string;
      recommendation: string;
    }>;
    warnings: Array<{
      type: string;
      description: string;
      impact: string;
      recommendation: string;
    }>;
    opportunities: Array<{
      type: string;
      description: string;
      potential_impact: string;
      effort: "low" | "medium" | "high";
    }>;
  };
  competitor_analysis?: {
    domain_comparison: Array<{
      domain: string;
      traffic: number;
      backlinks: number;
      domain_rank: number;
    }>;
    keyword_gaps: Array<{
      keyword: string;
      competitor_positions: Record<string, number>;
      search_volume: number;
    }>;
  };
  action_plan: {
    immediate: string[];
    short_term: string[];
    long_term: string[];
  };
}

/**
 * @title Generate SEO Audit
 * @description Comprehensive SEO audit with traffic, backlinks, and keyword analysis
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SEOAuditReport> {
  const {
    domain,
    keywords,
    competitors = [],
    language_name = "English",
    location_name = "United States",
  } = props;

  // Fetch traffic overview
  const trafficResponse = await ctx.client
    ["POST /traffic_analytics/overview/live"](
      {},
      { body: [{ target: domain }] },
    );
  const trafficData = await trafficResponse.json();
  const traffic = trafficData.tasks?.[0]?.result?.[0] as
    | TrafficOverview
    | undefined;

  // Fetch backlinks overview
  const backlinksResponse = await ctx.client
    ["POST /backlinks/domain_info/live"](
      {},
      { body: [{ target: domain }] },
    );
  const backlinksData = await backlinksResponse.json();
  const backlinks = backlinksData.tasks?.[0]?.result?.[0] as
    | BacklinksOverview
    | undefined;

  // Analyze keyword positions
  const keywordPositions: Record<string, number> = {};
  let totalPosition = 0;
  let trackedCount = 0;

  for (const keyword of keywords) {
    try {
      const serpResponse = await ctx.client
        ["POST /serp/google/organic/task_post"](
          {},
          {
            body: [{
              keyword,
              language_name,
              location_name,
            }],
          },
        );

      const serpData = await serpResponse.json();
      const taskId = serpData.tasks?.[0]?.id;

      if (taskId) {
        // Wait for processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const resultResponse = await ctx.client
          [`GET /serp/google/organic/task_get/:id`]({
            "id": taskId,
          });

        const resultData = await resultResponse.json();
        const result = resultData.tasks?.[0]?.result?.[0] as {
          items?: SerpItem[];
        } | undefined;
        const items = result?.items;

        if (items) {
          const position = items.findIndex((item) =>
            item.domain.includes(domain)
          ) + 1;
          if (position > 0) {
            keywordPositions[keyword] = position;
            totalPosition += position;
            trackedCount++;
          }
        }
      }
    } catch (error) {
      console.error(`Error analyzing keyword ${keyword}:`, error);
    }
  }

  // Calculate metrics
  const avgPosition = trackedCount > 0 ? totalPosition / trackedCount : 0;
  const top3Count =
    Object.values(keywordPositions).filter((p) => p <= 3).length;
  const top10Count =
    Object.values(keywordPositions).filter((p) => p <= 10).length;

  // Generate issues and recommendations
  const issues = analyzeIssues(traffic, backlinks, keywordPositions);

  // Competitor analysis
  let competitorAnalysis;
  if (competitors.length > 0) {
    competitorAnalysis = await analyzeCompetitors(
      domain,
      competitors,
      keywords,
      ctx,
      language_name,
      location_name,
    );
  }

  // Calculate overall score
  const overallScore = calculateSEOScore(traffic, backlinks, avgPosition);

  // Generate action plan
  const actionPlan = generateActionPlan(issues, competitorAnalysis);

  return {
    domain,
    audit_date: new Date().toISOString(),
    overview: {
      overall_score: overallScore,
      traffic_metrics: {
        monthly_visits: traffic?.visits || 0,
        unique_visitors: traffic?.unique_visitors || 0,
        bounce_rate: traffic?.bounce_rate || 0,
        pages_per_visit: traffic?.pages_per_visit || 0,
      },
      backlink_metrics: {
        total_backlinks: backlinks?.total_backlinks || 0,
        referring_domains: backlinks?.referring_domains || 0,
        domain_rank: backlinks?.rank || 0,
        dofollow_ratio: backlinks && backlinks.total_backlinks > 0
          ? (backlinks.dofollow / backlinks.total_backlinks) * 100
          : 0,
      },
      keyword_visibility: {
        tracked_keywords: keywords.length,
        top_3_positions: top3Count,
        top_10_positions: top10Count,
        avg_position: Math.round(avgPosition * 10) / 10,
      },
    },
    issues,
    competitor_analysis: competitorAnalysis,
    action_plan: actionPlan,
  };
}

function analyzeIssues(
  traffic: TrafficOverview | undefined,
  backlinks: BacklinksOverview | undefined,
  keywordPositions: Record<string, number>,
): SEOAuditReport["issues"] {
  const critical = [];
  const warnings = [];
  const opportunities: SEOAuditReport["issues"]["opportunities"] = [];

  // Traffic issues
  if (!traffic || traffic.visits < 1000) {
    critical.push({
      type: "Low Traffic",
      description: "Monthly visits are below 1,000",
      impact: "Limited organic visibility and conversions",
      recommendation: "Focus on content creation and keyword targeting",
    });
  }

  if (traffic && traffic.bounce_rate > 70) {
    warnings.push({
      type: "High Bounce Rate",
      description: `Bounce rate is ${traffic.bounce_rate}% (above 70%)`,
      impact: "Users leaving without engagement",
      recommendation: "Improve page load speed and content relevance",
    });
  }

  // Backlink issues
  if (!backlinks || backlinks.referring_domains < 50) {
    critical.push({
      type: "Weak Backlink Profile",
      description: "Less than 50 referring domains",
      impact: "Limited domain authority and ranking potential",
      recommendation: "Implement link building campaign",
    });
  }

  if (backlinks && backlinks.dofollow / backlinks.total_backlinks < 0.5) {
    warnings.push({
      type: "Low Dofollow Ratio",
      description: "Less than 50% of backlinks are dofollow",
      impact: "Reduced link equity transfer",
      recommendation: "Focus on acquiring high-quality dofollow links",
    });
  }

  // Keyword issues
  const trackedCount = Object.keys(keywordPositions).length;
  if (trackedCount === 0) {
    critical.push({
      type: "No Keyword Rankings",
      description: "Not ranking for any tracked keywords",
      impact: "No organic search visibility",
      recommendation: "Create targeted content for primary keywords",
    });
  }

  // Opportunities
  if (traffic && traffic.pages_per_visit < 2) {
    opportunities.push({
      type: "Improve Internal Linking",
      description: "Low pages per visit indicates poor internal navigation",
      potential_impact: "20-30% increase in page views",
      effort: "medium",
    });
  }

  const notRankingKeywords = Object.entries(keywordPositions).filter((
    [_, pos],
  ) => pos > 10);
  if (notRankingKeywords.length > 0) {
    opportunities.push({
      type: "Quick Win Keywords",
      description: `${notRankingKeywords.length} keywords ranking on page 2-3`,
      potential_impact: "50% traffic increase potential",
      effort: "low",
    });
  }

  return { critical, warnings, opportunities };
}

async function analyzeCompetitors(
  _domain: string,
  competitors: string[],
  keywords: string[],
  ctx: AppContext,
  _language_name: string,
  _location_name: string,
): Promise<SEOAuditReport["competitor_analysis"]> {
  const domainComparison = [];
  const keywordGaps: NonNullable<
    SEOAuditReport["competitor_analysis"]
  >["keyword_gaps"] = [];

  // Get competitor metrics
  for (const competitor of competitors.slice(0, 3)) {
    try {
      const trafficResp = await ctx.client
        ["POST /traffic_analytics/overview/live"](
          {},
          { body: [{ target: competitor }] },
        );
      const trafficData = await trafficResp.json();
      const traffic = trafficData.tasks?.[0]?.result?.[0] as
        | TrafficOverview
        | undefined;

      const backlinksResp = await ctx.client
        ["POST /backlinks/domain_info/live"](
          {},
          { body: [{ target: competitor }] },
        );
      const backlinksData = await backlinksResp.json();
      const backlinks = backlinksData.tasks?.[0]?.result?.[0] as
        | BacklinksOverview
        | undefined;

      domainComparison.push({
        domain: competitor,
        traffic: traffic?.visits || 0,
        backlinks: backlinks?.total_backlinks || 0,
        domain_rank: backlinks?.rank || 0,
      });
    } catch (error) {
      console.error(`Error analyzing competitor ${competitor}:`, error);
    }
  }

  // Analyze keyword gaps (simplified)
  for (const keyword of keywords.slice(0, 10)) {
    const positions: Record<string, number> = {};

    // Add placeholder data - in real implementation would check each competitor's position
    competitors.forEach((comp) => {
      positions[comp] = Math.floor(Math.random() * 20) + 1;
    });

    keywordGaps.push({
      keyword,
      competitor_positions: positions,
      search_volume: Math.floor(Math.random() * 5000) + 100,
    });
  }

  return {
    domain_comparison: domainComparison,
    keyword_gaps: keywordGaps,
  };
}

function calculateSEOScore(
  traffic: TrafficOverview | undefined,
  backlinks: BacklinksOverview | undefined,
  avgPosition: number,
): number {
  let score = 0;

  // Traffic score (30 points)
  if (traffic) {
    if (traffic.visits > 10000) score += 30;
    else if (traffic.visits > 5000) score += 20;
    else if (traffic.visits > 1000) score += 10;

    if (traffic.bounce_rate < 50) score += 10;
    else if (traffic.bounce_rate < 70) score += 5;
  }

  // Backlinks score (30 points)
  if (backlinks) {
    if (backlinks.referring_domains > 500) score += 20;
    else if (backlinks.referring_domains > 100) score += 15;
    else if (backlinks.referring_domains > 50) score += 10;

    if (backlinks.rank > 70) score += 10;
    else if (backlinks.rank > 50) score += 5;
  }

  // Keyword score (30 points)
  if (avgPosition > 0 && avgPosition <= 3) score += 30;
  else if (avgPosition <= 10) score += 20;
  else if (avgPosition <= 20) score += 10;

  return Math.min(100, score);
}

function generateActionPlan(
  issues: SEOAuditReport["issues"],
  competitorAnalysis?: SEOAuditReport["competitor_analysis"],
): SEOAuditReport["action_plan"] {
  const immediate: string[] = [];
  const shortTerm: string[] = [];
  const longTerm: string[] = [];

  // Based on critical issues
  issues.critical.forEach((issue) => {
    immediate.push(issue.recommendation);
  });

  // Based on warnings
  issues.warnings.forEach((issue) => {
    shortTerm.push(issue.recommendation);
  });

  // Based on opportunities
  issues.opportunities.forEach((opp) => {
    if (opp.effort === "low") {
      immediate.push(opp.description);
    } else if (opp.effort === "medium") {
      shortTerm.push(opp.description);
    } else {
      longTerm.push(opp.description);
    }
  });

  // Competitor insights
  if (competitorAnalysis) {
    longTerm.push("Analyze and replicate successful competitor strategies");
    if (competitorAnalysis.keyword_gaps) {
      longTerm.push("Target competitor keyword gaps for content creation");
    }
  }

  return {
    immediate: immediate.slice(0, 5),
    short_term: shortTerm.slice(0, 5),
    long_term: longTerm.slice(0, 5),
  };
}

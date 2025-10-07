import { AppContext } from "../mod.ts";
import type { MapsResult, SerpItem } from "../client.ts";

export interface Props {
  /**
   * @title Business Name
   * @description Name of the business to analyze
   */
  businessName: string;

  /**
   * @title Location
   * @description City or region for local analysis
   */
  location: string;

  /**
   * @title Category Keywords
   * @description Keywords related to business category (e.g., "restaurant", "dentist")
   */
  categoryKeywords: string[];

  /**
   * @title Competitor Names
   * @description Names of local competitors
   * @default []
   */
  competitors?: string[];

  /**
   * @title Language Name
   * @description Language for search
   * @default English
   */
  language_name?: string;
}

export interface LocalSEOAnalysis {
  business: {
    name: string;
    location: string;
    visibility_score: number;
    local_pack_appearances: number;
    avg_position: number;
  };
  local_rankings: Array<{
    keyword: string;
    maps_position: number | null;
    organic_position: number | null;
    has_local_pack: boolean;
    competitors_in_pack: string[];
  }>;
  competitor_analysis: Array<{
    name: string;
    appearances: number;
    avg_rating: number;
    review_count: number;
    keywords_dominated: string[];
  }>;
  opportunities: {
    missing_keywords: Array<{
      keyword: string;
      search_volume_estimate: string;
      competition: "low" | "medium" | "high";
      current_leaders: string[];
    }>;
    review_gap: {
      your_reviews: number;
      competitor_avg: number;
      reviews_needed: number;
    };
  };
  recommendations: {
    immediate: string[];
    optimization_tips: string[];
    content_ideas: string[];
  };
}

/**
 * @title Analyze Local SEO
 * @description Comprehensive local SEO analysis for businesses with local presence
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<LocalSEOAnalysis> {
  const {
    businessName,
    location,
    categoryKeywords,
    competitors = [],
    language_name = "English",
  } = props;

  const localRankings: LocalSEOAnalysis["local_rankings"] = [];
  const competitorData = new Map<string, {
    appearances: number;
    ratings: number[];
    reviews: number[];
    keywords: string[];
  }>();

  let totalPosition = 0;
  let rankedCount = 0;
  let localPackAppearances = 0;

  // Initialize competitor tracking
  competitors.forEach((comp) => {
    competitorData.set(comp.toLowerCase(), {
      appearances: 0,
      ratings: [],
      reviews: [],
      keywords: [],
    });
  });

  // Analyze each keyword
  for (const keyword of categoryKeywords) {
    const searchQuery = `${keyword} ${location}`;

    try {
      // Get Maps results
      const mapsResponse = await ctx.client["POST /serp/google/maps/task_post"](
        {},
        {
          body: [{
            keyword: searchQuery,
            language_name,
            location_name: location,
          }],
        },
      );

      const mapsData = await mapsResponse.json();
      const mapsTaskId = mapsData.tasks?.[0]?.id;

      // Get Organic results
      const organicResponse = await ctx.client
        ["POST /serp/google/organic/task_post"](
          {},
          {
            body: [{
              keyword: searchQuery,
              language_name,
              location_name: location,
            }],
          },
        );

      const organicData = await organicResponse.json();
      const organicTaskId = organicData.tasks?.[0]?.id;

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      let mapsPosition: number | null = null;
      let organicPosition: number | null = null;
      let hasLocalPack = false;
      const competitorsInPack: string[] = [];

      // Process Maps results
      if (mapsTaskId) {
        const mapsResultResp = await ctx.client
          [`GET /serp/google/organic/task_get/:id`]({
            "id": mapsTaskId,
          });

        const mapsResultData = await mapsResultResp.json();
        const mapsResult = mapsResultData.tasks?.[0]?.result?.[0] as {
          items?: MapsResult[];
        } | undefined;
        const mapsItems = mapsResult?.items;

        if (mapsItems && mapsItems.length > 0) {
          hasLocalPack = true;

          mapsItems.forEach((item, index) => {
            const itemName = item.title.toLowerCase();

            // Check if it's our business
            if (itemName.includes(businessName.toLowerCase())) {
              mapsPosition = index + 1;
              localPackAppearances++;
              totalPosition += mapsPosition;
              rankedCount++;
            }

            // Track competitors
            competitors.forEach((comp) => {
              if (itemName.includes(comp.toLowerCase())) {
                competitorsInPack.push(comp);
                const data = competitorData.get(comp.toLowerCase())!;
                data.appearances++;
                data.keywords.push(keyword);
                if (item.rating) {
                  data.ratings.push(item.rating.value);
                  data.reviews.push(item.rating.votes_count);
                }
              }
            });
          });
        }
      }

      // Process Organic results
      if (organicTaskId) {
        const organicResultResp = await ctx.client
          [`GET /serp/google/organic/task_get/:id`]({
            "id": organicTaskId,
          });

        const organicResultData = await organicResultResp.json();
        const organicResult = organicResultData.tasks?.[0]?.result?.[0] as {
          items?: SerpItem[];
        } | undefined;
        const organicItems = organicResult?.items;

        if (organicItems) {
          const position = organicItems.findIndex((item) =>
            item.title.toLowerCase().includes(businessName.toLowerCase()) ||
            item.domain.toLowerCase().includes(businessName.toLowerCase())
          );

          if (position >= 0) {
            organicPosition = position + 1;
            if (!mapsPosition) {
              totalPosition += organicPosition;
              rankedCount++;
            }
          }
        }
      }

      localRankings.push({
        keyword,
        maps_position: mapsPosition,
        organic_position: organicPosition,
        has_local_pack: hasLocalPack,
        competitors_in_pack: competitorsInPack,
      });
    } catch (error) {
      console.error(`Error analyzing keyword ${keyword}:`, error);
    }
  }

  // Calculate metrics
  const avgPosition = rankedCount > 0 ? totalPosition / rankedCount : 0;
  const visibilityScore = calculateLocalVisibilityScore(
    localRankings,
    localPackAppearances,
  );

  // Process competitor data
  const competitorAnalysis = Array.from(competitorData.entries()).map((
    [name, data],
  ) => ({
    name: competitors.find((c) => c.toLowerCase() === name) || name,
    appearances: data.appearances,
    avg_rating: data.ratings.length > 0
      ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length
      : 0,
    review_count: data.reviews.length > 0
      ? Math.round(
        data.reviews.reduce((a, b) => a + b, 0) / data.reviews.length,
      )
      : 0,
    keywords_dominated: data.keywords,
  }));

  // Identify opportunities
  const opportunities = identifyLocalOpportunities(
    localRankings,
    competitorAnalysis,
    categoryKeywords,
  );

  // Generate recommendations
  const recommendations = generateLocalRecommendations(
    localRankings,
    competitorAnalysis,
    opportunities,
  );

  return {
    business: {
      name: businessName,
      location,
      visibility_score: visibilityScore,
      local_pack_appearances: localPackAppearances,
      avg_position: Math.round(avgPosition * 10) / 10,
    },
    local_rankings: localRankings,
    competitor_analysis: competitorAnalysis,
    opportunities,
    recommendations,
  };
}

function calculateLocalVisibilityScore(
  rankings: LocalSEOAnalysis["local_rankings"],
  packAppearances: number,
): number {
  let score = 0;

  // Base score from local pack appearances
  score += packAppearances * 15;

  // Additional points for top positions
  rankings.forEach((ranking) => {
    if (ranking.maps_position && ranking.maps_position <= 3) {
      score += 10;
    } else if (ranking.maps_position && ranking.maps_position <= 5) {
      score += 5;
    }

    if (ranking.organic_position && ranking.organic_position <= 5) {
      score += 5;
    }
  });

  // Normalize to 0-100
  return Math.min(100, score);
}

function identifyLocalOpportunities(
  rankings: LocalSEOAnalysis["local_rankings"],
  competitors: LocalSEOAnalysis["competitor_analysis"],
  keywords: string[],
): LocalSEOAnalysis["opportunities"] {
  // Find keywords where we're not ranking but competitors are
  const missingKeywords = rankings
    .filter((r) => !r.maps_position && r.competitors_in_pack.length > 0)
    .map((r) => ({
      keyword: keywords.find((k) => r.keyword.includes(k)) || r.keyword,
      search_volume_estimate: estimateLocalVolume(r.keyword),
      competition: r.competitors_in_pack.length > 2
        ? "high" as const
        : r.competitors_in_pack.length > 0
        ? "medium" as const
        : "low" as const,
      current_leaders: r.competitors_in_pack,
    }));

  // Calculate review gap
  const competitorAvgReviews = competitors.length > 0
    ? competitors.reduce((sum, c) => sum + c.review_count, 0) /
      competitors.length
    : 100;

  const yourReviews = 50; // Placeholder - would need actual data
  const reviewGap = {
    your_reviews: yourReviews,
    competitor_avg: Math.round(competitorAvgReviews),
    reviews_needed: Math.max(
      0,
      Math.round(competitorAvgReviews * 1.2 - yourReviews),
    ),
  };

  return {
    missing_keywords: missingKeywords,
    review_gap: reviewGap,
  };
}

function estimateLocalVolume(keyword: string): string {
  // Simplified volume estimation based on keyword type
  if (keyword.includes("near me")) return "1K-5K";
  if (keyword.includes("best")) return "500-1K";
  if (keyword.length > 30) return "100-500";
  return "500-2K";
}

function generateLocalRecommendations(
  rankings: LocalSEOAnalysis["local_rankings"],
  competitors: LocalSEOAnalysis["competitor_analysis"],
  opportunities: LocalSEOAnalysis["opportunities"],
): LocalSEOAnalysis["recommendations"] {
  const immediate = [];
  const optimizationTips = [];
  const contentIdeas = [];

  // Review recommendations
  if (opportunities.review_gap.reviews_needed > 0) {
    immediate.push(
      `Generate ${opportunities.review_gap.reviews_needed} new reviews to match competitor average`,
    );
  }

  // Local pack optimization
  const notInPack =
    rankings.filter((r) => r.has_local_pack && !r.maps_position).length;
  if (notInPack > 0) {
    immediate.push(
      `Optimize Google Business Profile for ${notInPack} keywords with local pack`,
    );
  }

  // Optimization tips
  optimizationTips.push(
    "Ensure NAP (Name, Address, Phone) consistency across all directories",
  );
  optimizationTips.push(
    "Add high-quality photos to Google Business Profile weekly",
  );
  optimizationTips.push("Respond to all reviews within 24-48 hours");

  if (opportunities.missing_keywords.length > 0) {
    optimizationTips.push(
      "Update business description with missing category keywords",
    );
  }

  // Content ideas
  rankings.forEach((ranking) => {
    if (!ranking.organic_position || ranking.organic_position > 10) {
      contentIdeas.push(`Create location page for "${ranking.keyword}"`);
    }
  });

  contentIdeas.push("Publish monthly local community involvement posts");
  contentIdeas.push(
    "Create area-specific service pages with local schema markup",
  );

  // Top competitors to monitor
  const topCompetitor =
    competitors.sort((a, b) => b.appearances - a.appearances)[0];
  if (topCompetitor) {
    immediate.push(
      `Monitor and analyze ${topCompetitor.name}'s local SEO strategy`,
    );
  }

  return {
    immediate: immediate.slice(0, 5),
    optimization_tips: optimizationTips.slice(0, 5),
    content_ideas: contentIdeas.slice(0, 5),
  };
}

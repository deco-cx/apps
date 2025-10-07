import { AppContext } from "../mod.ts";
import type { SerpItem } from "../client.ts";

export interface Props {
  /**
   * @title Keywords
   * @description Keywords to track SERP features for
   */
  keywords: string[];

  /**
   * @title Domain
   * @description Your domain to check feature ownership
   */
  domain: string;

  /**
   * @title Language Name
   * @description Language for search
   * @default English
   */
  language_name?: string;

  /**
   * @title Location Name
   * @description Geographic location
   * @default United States
   */
  location_name?: string;

  /**
   * @title Device
   * @description Device type for search
   * @default desktop
   * @enum ["desktop", "mobile"]
   */
  device?: "desktop" | "mobile";
}

export interface SERPFeature {
  type:
    | "featured_snippet"
    | "people_also_ask"
    | "knowledge_panel"
    | "local_pack"
    | "video_carousel"
    | "image_pack"
    | "top_stories"
    | "site_links"
    | "faq"
    | "how_to";
  owned_by_you: boolean;
  owner_domain?: string;
  content_preview?: string;
}

export interface KeywordSERPAnalysis {
  keyword: string;
  search_volume_estimate: string;
  features_present: SERPFeature[];
  your_organic_position: number | null;
  opportunities: string[];
  difficulty_estimate: "easy" | "medium" | "hard";
}

export interface SERPFeaturesReport {
  summary: {
    total_keywords: number;
    keywords_with_features: number;
    features_owned: number;
    features_available: number;
    avg_features_per_serp: number;
  };
  feature_distribution: Record<string, {
    total_occurrences: number;
    owned_by_you: number;
    ownership_rate: number;
  }>;
  keyword_analysis: KeywordSERPAnalysis[];
  opportunities: {
    featured_snippets: Array<{
      keyword: string;
      current_owner: string;
      suggested_approach: string;
    }>;
    people_also_ask: Array<{
      keyword: string;
      questions: string[];
      content_gap: boolean;
    }>;
    other_features: Array<{
      feature_type: string;
      keywords: string[];
      implementation_guide: string;
    }>;
  };
  recommendations: {
    content_optimization: string[];
    technical_implementation: string[];
    monitoring_alerts: string[];
  };
}

/**
 * @title Track SERP Features
 * @description Monitor and analyze SERP features for target keywords
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SERPFeaturesReport> {
  const {
    keywords,
    domain,
    language_name = "English",
    location_name = "United States",
    device = "desktop",
  } = props;

  const keywordAnalyses: KeywordSERPAnalysis[] = [];
  const featureOccurrences = new Map<
    string,
    { total: number; owned: number }
  >();
  let totalFeaturesFound = 0;
  let featuresOwned = 0;

  // Analyze each keyword
  for (const keyword of keywords) {
    try {
      // Post SERP task
      const response = await ctx.client["POST /serp/google/organic/task_post"](
        {},
        {
          body: [{
            keyword,
            language_name,
            location_name,
            device,
            depth: 100,
          }],
        },
      );

      const data = await response.json();
      const taskId = data.tasks?.[0]?.id;

      if (!taskId) continue;

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Get results
      const resultResponse = await ctx.client
        [`GET /serp/google/organic/task_get/:id`]({
          "id": taskId,
        });

      const resultData = await resultResponse.json();
      const result = resultData.tasks?.[0]?.result?.[0] as {
        items?: SerpItem[];
      } | undefined;
      const items = result?.items;

      if (!items) continue;

      // Extract SERP features
      const features = extractSERPFeatures(items, domain);
      let organicPosition: number | null = null;

      // Find organic position
      items.forEach((item, index) => {
        if (item.type === "organic" && item.domain.includes(domain)) {
          organicPosition = index + 1;
        }
      });

      // Count features
      features.forEach((feature) => {
        totalFeaturesFound++;
        if (feature.owned_by_you) featuresOwned++;

        const current = featureOccurrences.get(feature.type) ||
          { total: 0, owned: 0 };
        current.total++;
        if (feature.owned_by_you) current.owned++;
        featureOccurrences.set(feature.type, current);
      });

      // Identify opportunities
      const opportunities = identifyFeatureOpportunities(
        features,
        organicPosition,
      );

      keywordAnalyses.push({
        keyword,
        search_volume_estimate: estimateSearchVolume(keyword),
        features_present: features,
        your_organic_position: organicPosition,
        opportunities,
        difficulty_estimate: estimateDifficulty(features, organicPosition),
      });
    } catch (error) {
      console.error(`Error analyzing keyword ${keyword}:`, error);
    }
  }

  // Calculate summary metrics
  const keywordsWithFeatures =
    keywordAnalyses.filter((k) => k.features_present.length > 0).length;
  const avgFeaturesPerSerp = totalFeaturesFound / keywords.length;

  // Generate feature distribution
  const featureDistribution: SERPFeaturesReport["feature_distribution"] = {};
  featureOccurrences.forEach((stats, featureType) => {
    featureDistribution[featureType] = {
      total_occurrences: stats.total,
      owned_by_you: stats.owned,
      ownership_rate: stats.total > 0 ? (stats.owned / stats.total) * 100 : 0,
    };
  });

  // Identify opportunities
  const opportunities = identifyGlobalOpportunities(keywordAnalyses);

  // Generate recommendations
  const recommendations = generateFeatureRecommendations(
    featureDistribution,
    keywordAnalyses,
    opportunities,
  );

  return {
    summary: {
      total_keywords: keywords.length,
      keywords_with_features: keywordsWithFeatures,
      features_owned: featuresOwned,
      features_available: totalFeaturesFound - featuresOwned,
      avg_features_per_serp: Math.round(avgFeaturesPerSerp * 10) / 10,
    },
    feature_distribution: featureDistribution,
    keyword_analysis: keywordAnalyses,
    opportunities,
    recommendations,
  };
}

function extractSERPFeatures(items: SerpItem[], domain: string): SERPFeature[] {
  const features: SERPFeature[] = [];

  items.forEach((item) => {
    let feature: SERPFeature | null = null;

    switch (item.type) {
      case "featured_snippet":
        feature = {
          type: "featured_snippet",
          owned_by_you: item.domain.includes(domain),
          owner_domain: item.domain,
          content_preview: item.description?.substring(0, 150),
        };
        break;

      case "people_also_ask":
        feature = {
          type: "people_also_ask",
          owned_by_you: false, // PAA doesn't have direct ownership
          content_preview: item.title,
        };
        break;

      case "knowledge_graph":
      case "knowledge_panel":
        feature = {
          type: "knowledge_panel",
          owned_by_you: item.domain?.includes(domain) || false,
          owner_domain: item.domain,
        };
        break;

      case "local_pack":
        feature = {
          type: "local_pack",
          owned_by_you: item.title?.toLowerCase().includes(domain) || false,
        };
        break;

      case "video":
      case "video_carousel":
        feature = {
          type: "video_carousel",
          owned_by_you: item.domain?.includes(domain) || false,
          owner_domain: item.domain,
        };
        break;

      case "images":
      case "images_pack":
        feature = {
          type: "image_pack",
          owned_by_you: false, // Hard to determine ownership
        };
        break;

      case "news":
      case "top_stories":
        feature = {
          type: "top_stories",
          owned_by_you: item.domain?.includes(domain) || false,
          owner_domain: item.domain,
        };
        break;

      case "site_links":
        if (item.domain?.includes(domain)) {
          feature = {
            type: "site_links",
            owned_by_you: true,
            owner_domain: domain,
          };
        }
        break;

      case "faq":
        feature = {
          type: "faq",
          owned_by_you: item.domain?.includes(domain) || false,
          owner_domain: item.domain,
        };
        break;

      case "how_to":
        feature = {
          type: "how_to",
          owned_by_you: item.domain?.includes(domain) || false,
          owner_domain: item.domain,
        };
        break;
    }

    if (feature) {
      features.push(feature);
    }
  });

  return features;
}

function identifyFeatureOpportunities(
  features: SERPFeature[],
  organicPosition: number | null,
): string[] {
  const opportunities: string[] = [];

  // Featured snippet opportunity
  const hasFeaturedSnippet = features.some((f) =>
    f.type === "featured_snippet"
  );
  const ownsFeaturedSnippet = features.some((f) =>
    f.type === "featured_snippet" && f.owned_by_you
  );

  if (
    hasFeaturedSnippet && !ownsFeaturedSnippet && organicPosition &&
    organicPosition <= 10
  ) {
    opportunities.push("Target featured snippet - you rank in top 10");
  }

  // PAA opportunity
  const hasPAA = features.some((f) => f.type === "people_also_ask");
  if (hasPAA) {
    opportunities.push(
      "Create FAQ content targeting People Also Ask questions",
    );
  }

  // Video opportunity
  const hasVideo = features.some((f) => f.type === "video_carousel");
  const ownsVideo = features.some((f) =>
    f.type === "video_carousel" && f.owned_by_you
  );
  if (hasVideo && !ownsVideo) {
    opportunities.push("Create video content to capture video carousel");
  }

  // Site links opportunity
  if (organicPosition === 1 && !features.some((f) => f.type === "site_links")) {
    opportunities.push("Optimize for sitelinks with clear site structure");
  }

  return opportunities;
}

function estimateSearchVolume(keyword: string): string {
  // Simplified estimation based on keyword characteristics
  const wordCount = keyword.split(" ").length;

  if (wordCount === 1) return "10K-50K";
  if (wordCount === 2) return "5K-20K";
  if (wordCount === 3) return "1K-10K";
  if (keyword.includes("how") || keyword.includes("what")) return "1K-5K";
  return "500-5K";
}

function estimateDifficulty(
  features: SERPFeature[],
  position: number | null,
): "easy" | "medium" | "hard" {
  const featureCount = features.length;

  if (featureCount >= 5) return "hard";
  if (featureCount >= 3) return "medium";
  if (position && position <= 5) return "easy";
  if (position && position <= 20) return "medium";
  return "hard";
}

function identifyGlobalOpportunities(
  analyses: KeywordSERPAnalysis[],
): SERPFeaturesReport["opportunities"] {
  const featuredSnippets = analyses
    .filter((a) =>
      a.features_present.some((f) =>
        f.type === "featured_snippet" && !f.owned_by_you
      ) &&
      a.your_organic_position && a.your_organic_position <= 10
    )
    .map((a) => {
      const snippet = a.features_present.find((f) =>
        f.type === "featured_snippet"
      )!;
      return {
        keyword: a.keyword,
        current_owner: snippet.owner_domain || "unknown",
        suggested_approach: generateSnippetStrategy(a),
      };
    });

  const paaOpportunities = analyses
    .filter((a) => a.features_present.some((f) => f.type === "people_also_ask"))
    .map((a) => ({
      keyword: a.keyword,
      questions: a.features_present
        .filter((f) => f.type === "people_also_ask")
        .map((f) => f.content_preview || "")
        .filter((q) => q.length > 0),
      content_gap: !a.your_organic_position || a.your_organic_position > 10,
    }));

  // Group other features
  const otherFeatures: Map<string, string[]> = new Map();
  analyses.forEach((a) => {
    a.features_present.forEach((f) => {
      if (
        !["featured_snippet", "people_also_ask"].includes(f.type) &&
        !f.owned_by_you
      ) {
        const keywords = otherFeatures.get(f.type) || [];
        keywords.push(a.keyword);
        otherFeatures.set(f.type, keywords);
      }
    });
  });

  const otherFeatureOpps = Array.from(otherFeatures.entries()).map((
    [type, keywords],
  ) => ({
    feature_type: type,
    keywords: [...new Set(keywords)].slice(0, 5),
    implementation_guide: getImplementationGuide(type),
  }));

  return {
    featured_snippets: featuredSnippets.slice(0, 10),
    people_also_ask: paaOpportunities.slice(0, 10),
    other_features: otherFeatureOpps,
  };
}

function generateSnippetStrategy(analysis: KeywordSERPAnalysis): string {
  if (analysis.your_organic_position && analysis.your_organic_position <= 3) {
    return "Optimize existing content with definition paragraph, bullet points, or table";
  } else if (
    analysis.your_organic_position && analysis.your_organic_position <= 10
  ) {
    return "Improve content comprehensiveness and add structured snippet-friendly format";
  }
  return "Create new comprehensive content targeting this keyword";
}

function getImplementationGuide(featureType: string): string {
  const guides: Record<string, string> = {
    video_carousel:
      "Create and optimize YouTube videos with target keywords in title and description",
    image_pack:
      "Add high-quality, optimized images with descriptive alt text and captions",
    local_pack: "Optimize Google Business Profile and build local citations",
    top_stories:
      "Publish timely, newsworthy content with proper news schema markup",
    faq: "Implement FAQ schema markup on relevant pages",
    how_to: "Create step-by-step guides with HowTo schema markup",
    site_links: "Improve site structure, internal linking, and page titles",
  };

  return guides[featureType] || "Optimize content for this SERP feature";
}

function generateFeatureRecommendations(
  distribution: SERPFeaturesReport["feature_distribution"],
  analyses: KeywordSERPAnalysis[],
  opportunities: SERPFeaturesReport["opportunities"],
): SERPFeaturesReport["recommendations"] {
  const contentOptimization = [];
  const technicalImplementation = [];
  const monitoringAlerts = [];

  // Content recommendations
  if (opportunities.featured_snippets.length > 5) {
    contentOptimization.push(
      "Create snippet-optimized content blocks (40-60 words) for high-volume keywords",
    );
  }

  if (opportunities.people_also_ask.length > 5) {
    contentOptimization.push(
      "Develop comprehensive FAQ sections addressing PAA questions",
    );
  }

  const noRankingKeywords =
    analyses.filter((a) => !a.your_organic_position).length;
  if (noRankingKeywords > analyses.length * 0.3) {
    contentOptimization.push(
      "Create new content targeting keywords where you don't currently rank",
    );
  }

  // Technical recommendations
  if (distribution.faq && distribution.faq.ownership_rate < 50) {
    technicalImplementation.push(
      "Implement FAQ schema markup across relevant pages",
    );
  }

  if (distribution.how_to && distribution.how_to.ownership_rate < 50) {
    technicalImplementation.push("Add HowTo schema markup to tutorial content");
  }

  if (!distribution.site_links || distribution.site_links.owned_by_you === 0) {
    technicalImplementation.push(
      "Optimize site architecture and internal linking for sitelinks eligibility",
    );
  }

  // Monitoring recommendations
  monitoringAlerts.push(
    "Set up weekly SERP feature tracking for top 20 keywords",
  );
  monitoringAlerts.push("Monitor competitor featured snippet wins/losses");
  monitoringAlerts.push("Track new SERP features appearing for your keywords");

  return {
    content_optimization: contentOptimization,
    technical_implementation: technicalImplementation,
    monitoring_alerts: monitoringAlerts,
  };
}

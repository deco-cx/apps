import { AppContext } from "../mod.ts";
import type { DataForSeoTaskResponse, KeywordData } from "../client.ts";

interface Props {
  /**
   * @title Keywords
   * @description Keywords to analyze difficulty (max 10)
   */
  keywords: string[];

  /**
   * @title Language
   * @description Language name (e.g., "English", "Portuguese")
   * @default English
   */
  language_name?: string;

  /**
   * @title Location
   * @description Location name (e.g., "United States", "Brazil")
   * @default United States
   */
  location_name?: string;
}

export interface KeywordDifficultyAnalysis {
  keyword: string;
  metrics: {
    search_volume: number;
    cpc: number;
    competition: number;
  };
  difficulty_score: number;
  difficulty_level: "easy" | "medium" | "hard" | "very hard";
  top_competitors: Array<{
    domain: string;
    position: number;
    title: string;
  }>;
  recommendations: string[];
}

/**
 * @title Analyze Keyword Difficulty
 * @description Analyze keyword difficulty based on competition and SERP analysis
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<KeywordDifficultyAnalysis[]> {
  const {
    keywords,
    language_name = "English",
    location_name = "United States",
  } = props;

  if (!keywords || keywords.length === 0) {
    throw new Error("Please provide at least one keyword");
  }

  if (keywords.length > 10) {
    throw new Error("Maximum 10 keywords allowed for difficulty analysis");
  }

  // Get search volume data
  const volumeTaskResponse = await ctx.client
    ["POST /keywords_data/google/search_volume/task_post"](
      {},
      {
        body: [{
          keywords,
          language_name,
          location_name,
        }],
      },
    );

  const volumeTaskData = await volumeTaskResponse
    .json() as DataForSeoTaskResponse;
  const volumeTaskId = volumeTaskData.tasks?.[0]?.id;

  if (!volumeTaskId) {
    throw new Error("Failed to create search volume task");
  }

  // Get SERP data for each keyword
  const serpTaskIds: { keyword: string; taskId: string }[] = [];

  for (const keyword of keywords) {
    const serpTaskResponse = await ctx.client
      ["POST /serp/google/organic/task_post"](
        {},
        {
          body: [{
            keyword,
            language_name,
            location_name,
            depth: 10,
          }],
        },
      );

    const serpTaskData = await serpTaskResponse
      .json() as DataForSeoTaskResponse;
    const serpTaskId = serpTaskData.tasks?.[0]?.id;

    if (serpTaskId) {
      serpTaskIds.push({ keyword, taskId: serpTaskId });
    }
  }

  // Wait for volume data
  let volumeData: KeywordData[] = [];
  let attempts = 0;
  const maxAttempts = 30;
  const delay = 2000;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delay));

    const volumeResultResponse = await ctx.client
      [`GET /keywords_data/google/search_volume/task_get/:id`]({
        id: volumeTaskId,
      });

    const volumeResultData = await volumeResultResponse
      .json() as DataForSeoTaskResponse;

    if (
      volumeResultData.status_code === 20000 &&
      volumeResultData.tasks?.[0]?.result
    ) {
      const volumeResults = volumeResultData.tasks[0].result as Array<{
        keyword: string;
        search_volume?: number;
        cpc?: number;
        competition?: number;
      }>;
      volumeData = volumeResults.map((item) => ({
        keyword: item.keyword,
        search_volume: item.search_volume || 0,
        cpc: item.cpc || 0,
        competition: item.competition || 0,
        competition_level: "medium" as string,
        monthly_searches: [],
      }));
      break;
    }

    attempts++;
  }

  // Get SERP results for each keyword
  const serpResults: Map<
    string,
    Array<{ domain: string; position: number; title: string }>
  > = new Map();

  for (const { keyword, taskId } of serpTaskIds) {
    attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delay));

      const serpResultResponse = await ctx.client
        [`GET /serp/google/organic/task_get/:id`]({
          id: taskId,
        });

      const serpResultData = await serpResultResponse
        .json() as DataForSeoTaskResponse;

      if (
        serpResultData.status_code === 20000 &&
        serpResultData.tasks?.[0]?.result?.[0]
      ) {
        const result = serpResultData.tasks[0].result[0] as {
          items?: Array<{
            type: string;
            domain: string;
            rank_absolute: number;
            title: string;
          }>;
        };

        if (result.items) {
          const items = result.items
            .filter((item) => item.type === "organic")
            .slice(0, 10)
            .map((item) => ({
              domain: item.domain,
              position: item.rank_absolute,
              title: item.title,
            }));

          serpResults.set(keyword, items);
        }
        break;
      }

      attempts++;
    }
  }

  // Analyze difficulty for each keyword
  return keywords.map((keyword) => {
    const metricsData = volumeData.find((v) => v.keyword === keyword);
    const metrics = metricsData || {
      search_volume: 0,
      cpc: 0,
      competition: 0,
    } as { search_volume: number; cpc: number; competition: number };

    const topCompetitors = (serpResults.get(keyword) || []).map((item) => ({
      domain: item.domain,
      position: item.position,
      title: item.title,
    }));

    // Calculate difficulty score (0-100)
    let difficultyScore = 0;

    // Factor 1: Competition level (0-1) = 30%
    difficultyScore += metrics.competition * 30;

    // Factor 2: Top 10 domain authority approximation = 40%
    const bigDomains = topCompetitors.filter((c) =>
      c.domain.includes("wikipedia") ||
      c.domain.includes("amazon") ||
      c.domain.includes("youtube") ||
      c.domain.includes("facebook") ||
      c.domain.includes("google") ||
      c.domain.includes("microsoft") ||
      c.domain.includes(".gov") ||
      c.domain.includes(".edu")
    ).length;
    difficultyScore += (bigDomains / 10) * 40;

    // Factor 3: Search volume impact = 20%
    if (metrics.search_volume > 10000) {
      difficultyScore += 20;
    } else if (metrics.search_volume > 1000) {
      difficultyScore += 10;
    } else if (metrics.search_volume > 100) {
      difficultyScore += 5;
    }

    // Factor 4: CPC as indicator of commercial value = 10%
    if (metrics.cpc > 5) {
      difficultyScore += 10;
    } else if (metrics.cpc > 2) {
      difficultyScore += 5;
    }

    // Determine difficulty level
    let difficultyLevel: "easy" | "medium" | "hard" | "very hard";
    if (difficultyScore < 25) {
      difficultyLevel = "easy";
    } else if (difficultyScore < 50) {
      difficultyLevel = "medium";
    } else if (difficultyScore < 75) {
      difficultyLevel = "hard";
    } else {
      difficultyLevel = "very hard";
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (difficultyLevel === "easy") {
      recommendations.push("Low competition - good opportunity for quick wins");
      recommendations.push(
        "Focus on creating comprehensive, high-quality content",
      );
    } else if (difficultyLevel === "medium") {
      recommendations.push(
        "Moderate competition - requires solid SEO strategy",
      );
      recommendations.push("Build topic authority with related content");
      recommendations.push("Focus on earning quality backlinks");
    } else if (difficultyLevel === "hard") {
      recommendations.push("High competition - consider long-tail variations");
      recommendations.push("Requires significant link building efforts");
      recommendations.push("Create exceptional, unique content to stand out");
    } else {
      recommendations.push(
        "Very high competition - extremely challenging to rank",
      );
      recommendations.push("Consider targeting less competitive variations");
      recommendations.push("Focus on building domain authority first");
    }

    if (metrics.search_volume < 100) {
      recommendations.push(
        "Low search volume - validate demand before investing heavily",
      );
    }

    return {
      keyword,
      metrics: metricsData || metrics,
      difficulty_score: Math.round(difficultyScore),
      difficulty_level: difficultyLevel,
      top_competitors: topCompetitors.slice(0, 5),
      recommendations,
    };
  });
}

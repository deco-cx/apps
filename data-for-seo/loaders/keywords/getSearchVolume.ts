import { AppContext } from "../../mod.ts";
import type { DataForSeoTaskResponse, KeywordData } from "../../client.ts";

interface Props {
  /**
   * @title Keywords
   * @description List of keywords to analyze (max 1000)
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

/**
 * @title Get Search Volume
 * @description Get search volume, CPC, and competition data for keywords
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<KeywordData[]> {
  const {
    keywords,
    language_name = "English",
    location_name = "United States",
  } = props;

  if (!keywords || keywords.length === 0) {
    throw new Error("Please provide at least one keyword");
  }

  if (keywords.length > 1000) {
    throw new Error("Maximum 1000 keywords allowed per request");
  }

  // Post the task
  const taskResponse = await ctx.client
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

  const taskData = await taskResponse.json() as DataForSeoTaskResponse;

  if (taskData.status_code !== 20000 || !taskData.tasks?.[0]) {
    throw new Error(taskData.status_message || "Failed to create task");
  }

  const taskId = taskData.tasks[0].id;

  // Wait for task completion (polling)
  let attempts = 0;
  const maxAttempts = 30;
  const delay = 2000; // 2 seconds

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delay));

    const resultResponse = await ctx.client
      [`GET /keywords_data/google/search_volume/task_get/:id`]({
        id: taskId,
      });

    const resultData = await resultResponse.json() as DataForSeoTaskResponse;

    if (resultData.status_code === 20000 && resultData.tasks?.[0]?.result) {
      const results = resultData.tasks[0].result as Array<{
        keyword: string;
        search_volume?: number;
        cpc?: number;
        competition?: number;
        competition_level?: string;
        monthly_searches?: Array<
          { year: number; month: number; search_volume: number }
        >;
      }>;

      // Transform the results to match our KeywordData interface
      return results.map((item) => ({
        keyword: item.keyword,
        search_volume: item.search_volume || 0,
        cpc: item.cpc || 0,
        competition: item.competition || 0,
        competition_level: item.competition_level || "low",
        monthly_searches: item.monthly_searches || [],
      }));
    }

    attempts++;
  }

  throw new Error("Task timeout - please try again later");
}

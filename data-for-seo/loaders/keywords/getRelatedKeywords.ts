import { AppContext } from "../../mod.ts";
import type { DataForSeoTaskResponse, RelatedKeyword } from "../../client.ts";

interface Props {
  /**
   * @title Keywords
   * @description Seed keywords to get related suggestions
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

  /**
   * @title Limit
   * @description Maximum number of related keywords to return
   * @default 100
   */
  limit?: number;

  /**
   * @title Include Seed
   * @description Include seed keywords in results
   * @default false
   */
  include_seed_keyword?: boolean;
}

/**
 * @title Get Related Keywords
 * @description Get keyword suggestions related to seed keywords
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<RelatedKeyword[]> {
  const {
    keywords,
    language_name = "English",
    location_name = "United States",
    limit = 100,
    include_seed_keyword = false,
  } = props;

  if (!keywords || keywords.length === 0) {
    throw new Error("Please provide at least one seed keyword");
  }

  // Post the task
  const taskResponse = await ctx.client
    ["POST /keywords_data/google/related_keywords/task_post"](
      {},
      {
        body: [{
          keywords,
          language_name,
          location_name,
          limit,
          include_seed_keyword,
          depth: 1,
        }],
      },
    );

  const taskData = await taskResponse.json() as DataForSeoTaskResponse;

  if (taskData.status_code !== 20000 || !taskData.tasks?.[0]) {
    throw new Error(taskData.status_message || "Failed to create task");
  }

  const taskId = taskData.tasks[0].id;

  // Wait for task completion
  let attempts = 0;
  const maxAttempts = 30;
  const delay = 2000;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delay));

    const resultResponse = await ctx.client
      [`GET /keywords_data/google/related_keywords/task_get/:id`]({
        id: taskId,
      });

    const resultData = await resultResponse.json() as DataForSeoTaskResponse;

    if (resultData.status_code === 20000 && resultData.tasks?.[0]?.result) {
      const results = resultData.tasks[0].result as Array<{
        items?: Array<{
          keyword?: string;
          search_volume?: number;
          cpc?: number;
          competition?: number;
          keyword_difficulty?: number;
          relevance?: number;
        }>;
      }>;

      // Flatten and transform results
      const relatedKeywords: RelatedKeyword[] = [];

      for (const item of results) {
        if (item.items) {
          for (const keyword of item.items) {
            relatedKeywords.push({
              keyword: keyword.keyword || "",
              search_volume: keyword.search_volume || 0,
              cpc: keyword.cpc || 0,
              competition: keyword.competition || 0,
              keyword_difficulty: keyword.keyword_difficulty || 0,
              relevance: keyword.relevance || 0,
            });
          }
        }
      }

      return relatedKeywords;
    }

    attempts++;
  }

  throw new Error("Task timeout - please try again later");
}

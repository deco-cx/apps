import { AppContext } from "../../mod.ts";
import type { DataForSeoTaskResponse, SerpItem } from "../../client.ts";

interface Props {
  /**
   * @title Keyword
   * @description The keyword to retrieve SERP results for
   */
  keyword: string;

  /**
   * @title Language
   * @description Search language (e.g., "English", "Portuguese")
   * @default English
   */
  language_name?: string;

  /**
   * @title Location
   * @description Location for the SERP results
   * @default United States
   */
  location_name?: string;

  /**
   * @title Device
   * @description Device type for search results
   * @default desktop
   * @enum ["desktop", "mobile"]
   */
  device?: "desktop" | "mobile";

  /**
   * @title Depth
   * @description Number of results to return (max 100)
   * @default 100
   */
  depth?: number;
}

/**
 * @title Get Organic Results
 * @description Get organic search results from Google SERP
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SerpItem[]> {
  const {
    keyword,
    language_name = "English",
    location_name = "United States",
    device = "desktop",
    depth = 100,
  } = props;

  if (!keyword) {
    throw new Error("Keyword is required");
  }

  // Post the task
  const taskResponse = await ctx.client["POST /serp/google/organic/task_post"](
    {},
    {
      body: [{
        keyword,
        language_name,
        location_name,
        device,
        depth,
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
      [`GET /serp/google/organic/task_get/:id`]({
        id: taskId,
      });

    const resultData = await resultResponse.json() as DataForSeoTaskResponse;

    if (resultData.status_code === 20000 && resultData.tasks?.[0]?.result) {
      const result = resultData.tasks[0].result[0] as {
        items?: Array<{
          type: string;
          rank_group: number;
          rank_absolute: number;
          position: string;
          url: string;
          domain: string;
          title: string;
          description: string;
          breadcrumb?: string;
          rating?: { value: number; votes_count: number };
        }>;
      };

      if (result && result.items) {
        // Filter only organic results
        return result.items
          .filter((item: { type: string }) => item.type === "organic")
          .map((item: {
            type: string;
            rank_group: number;
            rank_absolute: number;
            position: string;
            url: string;
            domain: string;
            title: string;
            description: string;
            breadcrumb?: string;
            rating?: { value: number; votes_count: number };
          }) => ({
            type: item.type,
            rank_group: item.rank_group,
            rank_absolute: item.rank_absolute,
            position: item.position,
            url: item.url,
            domain: item.domain,
            title: item.title,
            description: item.description,
            breadcrumb: item.breadcrumb,
            is_paid: false,
            rating: item.rating,
          }));
      }

      return [];
    }

    attempts++;
  }

  throw new Error("Task timeout - please try again later");
}

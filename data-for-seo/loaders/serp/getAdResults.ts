import { AppContext } from "../../mod.ts";
import type { DataForSeoTaskResponse, GoogleAd } from "../../client.ts";

interface Props {
  /**
   * @title Keyword
   * @description The keyword to retrieve ads for
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
   * @description Location for the SERP ads
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
}

/**
 * @title Get Ad Results
 * @description Get paid ads results from Google SERP
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GoogleAd[]> {
  const {
    keyword,
    language_name = "English",
    location_name = "United States",
    device = "desktop",
  } = props;

  if (!keyword) {
    throw new Error("Keyword is required");
  }

  // Post the task
  const taskResponse = await ctx.client["POST /serp/google/ads/task_post"](
    {},
    {
      body: [{
        keyword,
        language_name,
        location_name,
        device,
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
      [`GET /serp/google/ads/task_get/:id`]({
        id: taskId,
      });

    const resultData = await resultResponse.json() as DataForSeoTaskResponse;

    if (resultData.status_code === 20000 && resultData.tasks?.[0]?.result) {
      const result = resultData.tasks[0].result[0] as {
        items?: Array<{
          type: string;
          rank_group: number;
          rank_absolute: number;
          advertiser_id?: string;
          creative_id?: string;
          title: string;
          description: string;
          url: string;
          domain: string;
          breadcrumb: string;
          phone?: string;
        }>;
      };

      if (result && result.items) {
        // Filter only paid ads
        return result.items
          .filter((item: { type: string }) =>
            item.type === "paid" || item.type === "shopping"
          )
          .map((item: {
            type: string;
            rank_group: number;
            rank_absolute: number;
            advertiser_id?: string;
            creative_id?: string;
            title: string;
            description: string;
            url: string;
            domain: string;
            breadcrumb: string;
            phone?: string;
          }) => ({
            type: item.type,
            rank_group: item.rank_group,
            rank_absolute: item.rank_absolute,
            advertiser_id: item.advertiser_id || "",
            creative_id: item.creative_id || "",
            title: item.title,
            description: item.description,
            url: item.url,
            domain: item.domain,
            breadcrumb: item.breadcrumb,
            is_mobile: device === "mobile",
            phone: item.phone,
          }));
      }

      return [];
    }

    attempts++;
  }

  throw new Error("Task timeout - please try again later");
}

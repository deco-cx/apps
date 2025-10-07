import { AppContext } from "../../mod.ts";
import { DataForSeoTaskResponse } from "../../client.ts";

export interface Props {
  /**
   * @title Keyword
   * @description The search query for Google Maps
   */
  keyword: string;

  /**
   * @title Language Name
   * @description Language for the search (e.g., 'English', 'Portuguese')
   */
  language_name?: string;

  /**
   * @title Location Name
   * @description Geographic location (e.g., 'New York', 'São Paulo')
   */
  location_name?: string;

  /**
   * @title Device
   * @description Device type for the search
   * @default desktop
   * @enum ["desktop", "mobile"]
   */
  device?: "desktop" | "mobile";
}

export interface MapsResult {
  type: string;
  rank_group: number;
  rank_absolute: number;
  title: string;
  rating?: {
    value: number;
    votes_count: number;
    rating_max: number;
  };
  price_level?: string;
  category?: string;
  phone?: string;
  address?: string;
  website?: string;
  domain?: string;
  place_id: string;
  cid: string;
  latitude: number;
  longitude: number;
  is_closed?: boolean;
  is_temporarily_closed?: boolean;
  is_claimed?: boolean;
  work_hours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
}

/**
 * @title DataForSEO - Google Maps Results
 * @description Get Google Maps local search results including business information, ratings, and location data
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MapsResult[]> => {
  const { keyword, language_name, location_name, device = "desktop" } = props;

  // Post the task
  const taskResponse = await ctx.client["POST /serp/google/maps/task_post"](
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

  if (taskData.status_code !== 20000 || !taskData.tasks?.[0]?.id) {
    throw new Error(`DataForSEO API Error: ${taskData.status_message}`);
  }

  const taskId = taskData.tasks[0].id;

  // Wait a bit for processing
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Get results (simplified polling)
  const resultResponse = await ctx.client
    [`GET /serp/google/organic/task_get/:id`](
      {
        "id": taskId,
      },
    );

  const resultData = await resultResponse.json() as DataForSeoTaskResponse;

  if (resultData.status_code === 20000 && resultData.tasks?.[0]?.result) {
    const taskResult = resultData.tasks[0].result[0] as {
      items?: MapsResult[];
    };

    if (taskResult?.items) {
      return taskResult.items.filter((item) =>
        item.type === "maps_search" ||
        item.type === "local_pack" ||
        item.type === "maps_paid_item"
      );
    }
  }

  throw new Error(
    `DataForSEO API Error: ${resultData.status_message || "No results found"}`,
  );
};

export default loader;

import { AppContext } from "../../mod.ts";
import { DataForSeoTaskResponse } from "../../client.ts";

export interface Props {
  /**
   * @title Keywords
   * @description List of keywords to analyze Google Ads competition
   */
  keywords: string[];

  /**
   * @title Language Name
   * @description Language of the keywords (e.g., 'English', 'Portuguese')
   */
  language_name?: string;

  /**
   * @title Location Name
   * @description Geographic location (e.g., 'United States', 'Brazil')
   */
  location_name?: string;
}

export interface AdsCompetitionData {
  keyword: string;
  competition: number;
  competition_level: "low" | "medium" | "high";
  cpc: number;
  search_volume: number;
  advertisers_count: number;
  bid_high: number;
  bid_low: number;
  top_of_page_bid_high: number;
  top_of_page_bid_low: number;
}

/**
 * @title DataForSEO - Google Ads Competition
 * @description Get Google Ads competition data for keywords including CPC, competition level, and bid estimates
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AdsCompetitionData[]> => {
  const { keywords, language_name, location_name } = props;

  // Post the task
  const taskResponse = await ctx.client
    ["POST /keywords_data/google/ads_competition/task_post"](
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

  if (taskData.status_code !== 20000 || !taskData.tasks?.[0]?.id) {
    throw new Error(`DataForSEO API Error: ${taskData.status_message}`);
  }

  const taskId = taskData.tasks[0].id;

  // Wait a bit for processing
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Get results (simplified polling)
  const resultResponse = await ctx.client
    [`GET /keywords_data/google/search_volume/task_get/:id`]({
      "id": taskId,
    });

  const resultData = await resultResponse.json() as DataForSeoTaskResponse;

  if (resultData.status_code === 20000 && resultData.tasks?.[0]?.result) {
    const results = resultData.tasks[0].result as Array<{
      keyword: string;
      competition?: number;
      competition_level?: string;
      cpc?: number;
      search_volume?: number;
      advertisers_count?: number;
      bid_high?: number;
      bid_low?: number;
      top_of_page_bid_high?: number;
      top_of_page_bid_low?: number;
    }>;

    return results.map((item) => ({
      keyword: item.keyword,
      competition: item.competition || 0,
      competition_level: (item.competition_level || "low") as
        | "low"
        | "medium"
        | "high",
      cpc: item.cpc || 0,
      search_volume: item.search_volume || 0,
      advertisers_count: item.advertisers_count || 0,
      bid_high: item.bid_high || 0,
      bid_low: item.bid_low || 0,
      top_of_page_bid_high: item.top_of_page_bid_high || 0,
      top_of_page_bid_low: item.top_of_page_bid_low || 0,
    }));
  } else {
    throw new Error(`DataForSEO API Error: ${resultData.status_message}`);
  }
};

export default loader;

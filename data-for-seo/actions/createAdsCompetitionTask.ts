import { AppContext } from "../mod.ts";
import { handleDataForSeoResponse } from "../utils/handleResponse.ts";

interface Props {
  /**
   * @title Keywords
   * @description List of keywords to analyze Google Ads competition
   */
  keywords: string[];

  /**
   * @title Language Name
   * @description Language of the keywords (e.g., "English", "Portuguese")
   */
  language_name?: string;

  /**
   * @title Location Name
   * @description Geographic location (e.g., "United States", "Brazil")
   */
  location_name?: string;
}

/**
 * @name CREATE_ADS_COMPETITION_TASK
 * @title Create Ads Competition Task
 * @description Create a task to analyze Google Ads competition data for keywords
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client
    ["POST /keywords_data/google/ads_competition/task_post"](
      {},
      {
        body: [{
          keywords: props.keywords,
          language_name: props.language_name,
          location_name: props.location_name,
        }],
      },
    );
  return await handleDataForSeoResponse(response, "Ads Competition POST");
}

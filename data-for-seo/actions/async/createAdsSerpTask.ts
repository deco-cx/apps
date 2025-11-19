import { AppContext } from "../../mod.ts";
import { handleTaskCreationResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Keyword
   * @description The keyword to search for ads
   */
  keyword: string;

  /**
   * @title Language Name
   * @description Search language (e.g., "English", "Portuguese")
   */
  language_name?: string;

  /**
   * @title Location Name
   * @description Location for the search (e.g., "United States", "Brazil")
   */
  location_name?: string;

  /**
   * @title Device
   * @description Device type for search results
   */
  device?: "desktop" | "mobile";
}

/**
 * @name CREATE_ADS_SERP_TASK
 * @title Create Ads SERP Task
 * @description Create a task to analyze paid ads results from Google
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["POST /serp/google/ads/task_post"](
    {},
    {
      body: [{
        keyword: props.keyword,
        language_name: props.language_name,
        location_name: props.location_name,
        device: props.device,
      }],
    },
  );
  return await handleTaskCreationResponse(response, "Anúncios do Google");
}

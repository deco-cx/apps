import { AppContext } from "../../mod.ts";
import { handleTaskCreationResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Keyword
   * @description The search query for Google Maps
   */
  keyword: string;

  /**
   * @title Language Name
   * @description Language for the search (e.g., "English", "Portuguese")
   */
  language_name?: string;

  /**
   * @title Location Name
   * @description Geographic location (e.g., "New York", "São Paulo")
   */
  location_name?: string;

  /**
   * @title Device
   * @description Device type for the search
   */
  device?: "desktop" | "mobile";
}

/**
 * @name CREATE_MAPS_SERP_TASK
 * @title Create Maps SERP Task
 * @description Create a task to analyze Google Maps local results
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["POST /serp/google/maps/task_post"](
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
  return await handleTaskCreationResponse(response, "Google Maps Local");
}

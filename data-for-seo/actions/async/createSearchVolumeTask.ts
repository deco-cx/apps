import { AppContext } from "../../mod.ts";
import { handleTaskCreationResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Keywords
   * @description List of keywords to analyze
   */
  keywords: string[];

  /**
   * @title Language Name
   * @description Language for the search (e.g., "English", "Portuguese")
   */
  language_name?: string;

  /**
   * @title Location Name
   * @description Location for the search (e.g., "United States", "Brazil")
   */
  location_name?: string;
}

/**
 * @name CREATE_SEARCH_VOLUME_TASK
 * @title Create Search Volume Task
 * @description Create a task to analyze search volume data for keywords
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client
    ["POST /keywords_data/google/search_volume/task_post"](
      {},
      {
        body: [{
          keywords: props.keywords,
          language_name: props.language_name,
          location_name: props.location_name,
        }],
      },
    );
  return await handleTaskCreationResponse(response, "Volume de Busca");
}

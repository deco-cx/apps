import { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Task ID
   * @description The task ID returned from the search volume post request
   */
  task_id: string;
}

/**
 * @name KEYWORDS_SEARCH_VOLUME_GET
 * @title Get Search Volume Result (Async - Step 2)
 * @description Get the result of a search volume task. ⚠️ REQUIRES: First create a task using 'Create Search Volume Task' action to get a task_id
 * @workflow 1) Create task with createSearchVolumeTask → 2) Wait 3-5 seconds → 3) Use this loader with the task_id
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  try {
    const response = await ctx.client
      ["GET /keywords_data/google/search_volume/task_get/:id"]({
        id: props.task_id,
      });
    return await handleDataForSeoResponse(response, "Search Volume Result");
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

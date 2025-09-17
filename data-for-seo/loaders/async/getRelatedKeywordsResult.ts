import { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Task ID
   * @description The task ID returned from the related keywords post request
   */
  task_id: string;
}

/**
 * @name KEYWORDS_RELATED_KEYWORDS_GET
 * @title Get Related Keywords Result (Async - Step 2)
 * @description Get the result of a related keywords task. ⚠️ REQUIRES: First create a task using 'Create Related Keywords Task' action to get a task_id
 * @workflow 1) Create task with createRelatedKeywordsTask → 2) Wait 3-5 seconds → 3) Use this loader with the task_id
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  try {
    const response = await ctx.client
      ["GET /keywords_data/google/related_keywords/task_get/:id"]({
        id: props.task_id,
      });

    return await handleDataForSeoResponse(response, "Related Keywords Result");
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

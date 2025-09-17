import { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Task ID
   * @description The task ID returned from the ads competition post request
   */
  task_id: string;
}

/**
 * @name KEYWORDS_ADS_COMPETITION_GET
 * @title Get Ads Competition Result (Async - Step 2)
 * @description Get the result of an ads competition task. ⚠️ REQUIRES: First create a task using 'Create Ads Competition Task' action to get a task_id
 * @workflow 1) Create task with createAdsCompetitionTask → 2) Wait 3-5 seconds → 3) Use this loader with the task_id
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  try {
    const response = await ctx.client
      ["GET /keywords_data/google/ads_competition/task_get/:id"]({
        id: props.task_id,
      });
    return await handleDataForSeoResponse(response, "Ads Competition Result");
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

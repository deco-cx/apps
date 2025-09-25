import { AppContext } from "../mod.ts";
import { ActorRunResponse } from "../utils/types.ts";

export interface Props {
  /**
   * @title Actor ID
   * @description The ID of the actor
   */
  actorId: string;

  /**
   * @title Run ID
   * @description The ID of the actor run
   */
  runId: string;

  /**
   * @title Include Dataset Items
   * @description If true, include dataset items in the response
   */
  includeDatasetItems?: boolean;
}

/**
 * @name GET_ACTOR_RUN
 * @title Get Actor Run
 * @description Get details of a specific actor run
 */
export default async function getActorRun(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ActorRunResponse | { error: string }> {
  try {
    const { actorId, runId } = props;

    if (!actorId || !runId) {
      return { error: "Actor ID and Run ID are required" };
    }

    const response = await ctx.api["GET /v2/acts/:actorId/runs/:runId"]({
      actorId,
      runId,
    });

    const result = await response.json() as ActorRunResponse;

    if (props.includeDatasetItems && result.data.defaultDatasetId) {
      const datasetItemsResponse = await ctx.api
        ["GET /v2/datasets/:datasetId/items"]({
          datasetId: result.data.defaultDatasetId,
          format: "json",
        });
      result.data.results = await datasetItemsResponse.json(); // Place dataset items in the response.
    }

    return result;
  } catch (error) {
    console.error("Error getting actor run:", error);
    return ctx.errorHandler.toHttpError(error, "Error getting actor run");
  }
}

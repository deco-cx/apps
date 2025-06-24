import { AppContext } from "../mod.ts";
import { ActorRun } from "../utils/types.ts";

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
): Promise<ActorRun | { error: string }> {
  try {
    const { actorId, runId } = props;

    if (!actorId || !runId) {
      return { error: "Actor ID and Run ID are required" };
    }

    const response = await ctx.api["GET /v2/acts/:actorId/runs/:runId"]({
      actorId,
      runId,
    });

    return response.json();
  } catch (error) {
    console.error("Error getting actor run:", error);
    return ctx.errorHandler.toHttpError(error, "Error getting actor run");
  }
}

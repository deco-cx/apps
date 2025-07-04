import { AppContext } from "../mod.ts";
import { ActorRunsResponse } from "../utils/types.ts";

export interface Props {
  /**
   * @title Actor ID
   * @description The ID of the actor
   */
  actorId: string;

  /**
   * @title Limit
   * @description Maximum number of runs to return (default: 10)
   */
  limit?: number;

  /**
   * @title Offset
   * @description Number of runs to skip (default: 0)
   */
  offset?: number;

  /**
   * @title Status
   * @description Filter runs by status (READY, RUNNING, SUCCEEDED, FAILED, TIMING-OUT, TIMED-OUT, ABORTING, ABORTED)
   */
  status?: string;

  /**
   * @title Descending Order
   * @description If true, sort results in descending order by creation date
   */
  desc?: boolean;
}

/**
 * @title List Actor Runs
 * @name LIST_ACTOR_RUNS
 * @description List runs of a specific actor
 */
export default async function listActorRuns(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ActorRunsResponse | { error: string }> {
  try {
    const { actorId, limit = 10, offset = 0, status, desc = true } = props;

    if (!actorId) {
      return { error: "Actor ID is required" };
    }

    const response = await ctx.api["GET /v2/acts/:actorId/runs"]({
      actorId,
      limit,
      offset,
      status,
      desc,
    });

    return response.json();
  } catch (error) {
    console.error("Error listing actor runs:", error);
    return ctx.errorHandler.toHttpError(error, "Error listing actor runs");
  }
}

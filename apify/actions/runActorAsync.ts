import { AppContext } from "../mod.ts";
import { ActorRun } from "../utils/types.ts";

export interface Props {
  /**
   * @title Actor ID
   * @description The ID of the actor to run
   */
  actorId: string;

  /**
   * @title Input
   * @description Input data for the actor run (Stringified JSON object). If you don't know what object to pass, use an empty object: {}
   */
  input: string;

  /**
   * @title Timeout (seconds)
   * @description Maximum timeout for the run in seconds
   */
  timeout?: number;

  /**
   * @title Memory (MB)
   * @description Amount of memory allocated for the run in megabytes
   */
  memory?: number;

  /**
   * @title Build
   * @description Specific build version to use (optional)
   */
  build?: string;
}

/**
 * @name RUN_ACTOR_ASYNC
 * @title Run Actor Async
 * @description Run an Apify actor asynchronously and return immediately without waiting for completion
 */
export default async function runActorAsync(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  { data: ActorRun; error: null } | {
    error: string;
    data: null;
  }
> {
  try {
    const { actorId, timeout, memory, build } = props;

    if (!actorId) {
      return { error: "Actor ID is required", data: null };
    }

    // Build query parameters
    const searchParams = new URLSearchParams();
    if (timeout !== undefined) {
      searchParams.set("timeout", timeout.toString());
    }
    if (memory !== undefined) {
      searchParams.set("memory", memory.toString());
    }
    if (build !== undefined) {
      searchParams.set("build", build);
    }

    const response = await ctx.api["POST /v2/acts/:actorId/runs"]({
      actorId,
      ...(searchParams.toString() ? { searchParams } : {}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return { data: result, error: null };
  } catch (error) {
    console.error("Error starting actor run:", error);
    return {
      error: ctx.errorHandler.toHttpError(error, "Error starting actor run"),
      data: null,
    };
  }
}

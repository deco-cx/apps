import { AppContext } from "../mod.ts";

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
 * @name RUN_ACTOR_V2
 * @title Run Actor V2
 * @description Run an Apify actor synchronously and return dataset items
 */
export default async function runActorV2(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  { data: Array<Record<string, unknown>>; error: null } | {
    error: string;
    data: null;
  }
> {
  try {
    const { actorId, input: inputString, timeout, memory, build } = props;

    if (!actorId) {
      return { error: "Actor ID is required", data: null };
    }

    const response = await ctx.api
      ["POST /v2/acts/:actorId/run-sync-get-dataset-items"]({
        actorId,
        timeout,
        memory,
        build,
      }, {
        body: JSON.parse(inputString),
      });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return { data: result, error: null };
  } catch (error) {
    console.error("Error running actor:", error);
    return {
      error: ctx.errorHandler.toHttpError(error, "Error running actor"),
      data: null,
    };
  }
}

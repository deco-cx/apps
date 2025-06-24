import { AppContext } from "../mod.ts";
import { ActorsResponse } from "../utils/types.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of actors to return (default: 10)
   */
  limit?: number;

  /**
   * @title Offset
   * @description Number of actors to skip (default: 0)
   */
  offset?: number;

  /**
   * @title Only My Actors
   * @description If true, only return actors owned by the user
   */
  my?: boolean;

  /**
   * @title Descending Order
   * @description If true, sort results in descending order by creation date
   */
  desc?: boolean;
}

/**
 * @name LIST_ACTORS
 * @title List Actors
 * @description List actors from Apify platform
 */
export default async function listActors(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ActorsResponse | { error: string }> {
  try {
    const { limit = 10, offset = 0, my = false, desc = true } = props;

    const response = await ctx.api["GET /v2/acts"]({
      limit,
      offset,
      my,
      desc,
    });

    return response.json();
  } catch (error) {
    console.error("Error listing actors:", error);
    return ctx.errorHandler.toHttpError(error, "Error listing actors");
  }
}

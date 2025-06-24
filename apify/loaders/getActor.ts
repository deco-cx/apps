import { AppContext } from "../mod.ts";
import { Actor } from "../utils/types.ts";

export interface Props {
  /**
   * @title Actor ID
   * @description The ID or name of the actor (e.g., 'my-actor-id' or 'username~my-actor')
   */
  actorId: string;
}

/**
 * @title Get Actor
 * @description Get details of a specific actor
 */
export default async function getActor(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ data: Actor } | { error: string }> {
  try {
    const { actorId } = props;

    if (!actorId) {
      return { error: "Actor ID is required" };
    }

    const response = await ctx.api["GET /v2/acts/:actorId"]({
      actorId,
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting actor:", error);
    return ctx.errorHandler.toHttpError(error, "Error getting actor");
  }
} 
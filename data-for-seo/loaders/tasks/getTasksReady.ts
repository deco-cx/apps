import type { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

export interface Props {
  /**
   * @hidden
   */
  _dummy?: never;
}

/**
 * @title Get Tasks Ready
 * @description Returns the list of completed SERP tasks for Google Organic search
 */
export default async function loader(
  _props: Props,
  _req: Request,
  ctx: AppContext,
) {
  try {
    const response = await ctx.client["GET /serp/google/organic/tasks_ready"](
      {},
    );

    return await handleDataForSeoResponse(response, "Tasks Ready");
  } catch (error) {
    throw new Error(
      `Failed to get tasks ready: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

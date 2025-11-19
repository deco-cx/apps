import type { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

export interface Props {
  /**
   * @hidden
   */
  _dummy?: never;
}

/**
 * @title Get Tasks Fixed
 * @description Returns the list of tasks that have been fixed after an error
 */
export default async function loader(
  _props: Props,
  _req: Request,
  ctx: AppContext,
) {
  try {
    const response = await ctx.client["GET /serp/google/organic/tasks_fixed"](
      {},
    );

    return await handleDataForSeoResponse(response, "Tasks Fixed");
  } catch (error) {
    throw new Error(
      `Failed to get fixed tasks: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

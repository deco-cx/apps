import type { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

export interface Props {
  /**
   * @title Task ID
   * @description The ID of the task to retrieve HTML results for
   */
  taskId: string;
}

export interface HtmlTaskResult {
  keyword: string;
  type: string;
  se_domain: string;
  location_code: number;
  language_code: string;
  datetime: string;
  items_count: number;
  items: Array<{
    page: number;
    html: string;
  }>;
}

/**
 * @title Get Task Result - HTML
 * @description Retrieves the raw HTML of SERP results for a specific task ID
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { taskId } = props;

  if (!taskId) {
    throw new Error("Task ID is required");
  }

  try {
    const response = await ctx.client
      ["GET /serp/google/organic/task_get/html/:id"]({
        id: taskId,
      });

    const result = await handleDataForSeoResponse(response, "Task Result HTML");

    // Validação mais robusta da estrutura de resposta
    if (
      !result.tasks || !Array.isArray(result.tasks) || result.tasks.length === 0
    ) {
      throw new Error("Invalid response structure: no tasks found");
    }

    const task = result.tasks[0];

    if (
      !task.result || !Array.isArray(task.result) || task.result.length === 0
    ) {
      throw new Error(`Task ${taskId} completed but returned no results`);
    }

    // DataForSEO sempre retorna apenas um resultado para task_get endpoints
    return task.result[0] as HtmlTaskResult;
  } catch (error) {
    throw new Error(
      `Failed to get HTML task result: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

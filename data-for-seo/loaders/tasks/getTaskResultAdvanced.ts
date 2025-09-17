import type { AppContext } from "../../mod.ts";
import type { SerpItem } from "../../client.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

export interface Props {
  /**
   * @title Task ID
   * @description The ID of the task to retrieve advanced results for
   */
  taskId: string;
}

export interface AdvancedTaskResult {
  keyword: string;
  type: string;
  se_domain: string;
  location_code: number;
  language_code: string;
  check_url: string;
  datetime: string;
  spell?: {
    query: string;
    type: string;
  };
  refinement_chips?: Array<{
    type: string;
    title: string;
    url: string;
    domain: string;
    options?: Array<{
      type: string;
      title: string;
      url: string;
      domain: string;
    }>;
  }>;
  item_types: string[];
  se_results_count: number;
  items_count: number;
  items: Array<SerpItem | Record<string, unknown>>; // Advanced results include various SERP features
  related_searches?: Array<{
    query: string;
    url: string;
  }>;
  credits_used?: number;
  serp_screenshot?: string;
}

/**
 * @title Get Task Result - Advanced
 * @description Retrieves advanced SERP results with additional features for a specific task ID
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
      ["GET /serp/google/organic/task_get/advanced/:id"]({
        id: taskId,
      });

    const result = await handleDataForSeoResponse(
      response,
      "Task Result Advanced",
    );

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
    return task.result[0] as AdvancedTaskResult;
  } catch (error) {
    throw new Error(
      `Failed to get advanced task result: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

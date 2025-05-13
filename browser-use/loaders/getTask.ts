import { AppContext } from "../mod.ts";
import { TaskResponse } from "../client.ts";

export interface Props {
  /**
   * @title Task ID
   * @description ID of the task to retrieve details for
   */
  taskId: string;
}

/**
 * @title Get Task Details
 * @description Retrieve comprehensive information about a task
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TaskResponse> => {
  const { taskId } = props;

  const response = await ctx.api["GET /api/v1/task/:task_id"]({
    task_id: taskId,
  });

  const result = await response.json();
  return result;
};

export default loader;

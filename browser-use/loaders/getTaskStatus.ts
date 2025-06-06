import { AppContext } from "../mod.ts";
import { TaskStatusEnum } from "../client.ts";

export interface Props {
  /**
   * @title Task ID
   * @description ID of the task to check status for
   */
  taskId: string;
}

/**
 * @title Get Task Status
 * @description Check the current status of a task (running, finished, etc.)
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TaskStatusEnum> => {
  const { taskId } = props;

  const response = await ctx.api["GET /api/v1/task/:task_id/status"]({
    task_id: taskId,
  });

  const result = await response.json();
  return result;
};

export default loader;

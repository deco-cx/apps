import { AppContext } from "../mod.ts";
import { TaskScreenshotsResponse } from "../client.ts";

export interface Props {
  /**
   * @title Task ID
   * @description ID of the task to retrieve screenshots for
   */
  taskId: string;
}

/**
 * @title Get Task Screenshots
 * @description Retrieve screenshots taken during task execution
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TaskScreenshotsResponse> => {
  const { taskId } = props;

  const response = await ctx.api["GET /api/v1/task/:task_id/screenshots"]({
    task_id: taskId,
  });

  const result = await response.json();
  return result;
};

export default loader;

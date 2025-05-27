import { AppContext } from "../mod.ts";
import { TaskMediaResponse } from "../client.ts";

export interface Props {
  /**
   * @title Task ID
   * @description ID of the task to retrieve media for
   */
  taskId: string;
}

/**
 * @title Get Task Media
 * @description Retrieve recordings generated during task execution
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TaskMediaResponse> => {
  const { taskId } = props;

  const response = await ctx.api["GET /api/v1/task/:task_id/media"]({
    task_id: taskId,
  });

  const result = await response.json();
  return result;
};

export default loader;

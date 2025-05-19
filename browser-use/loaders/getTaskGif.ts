import { AppContext } from "../mod.ts";
import { TaskGifResponse } from "../client.ts";

export interface Props {
  /**
   * @title Task ID
   * @description ID of the task to retrieve GIF for
   */
  taskId: string;
}

/**
 * @title Get Task GIF
 * @description Retrieve an animated GIF of the task execution
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TaskGifResponse> => {
  const { taskId } = props;

  const response = await ctx.api["GET /api/v1/task/:task_id/gif"]({
    task_id: taskId,
  });

  const result = await response.json();
  return result;
};

export default loader;

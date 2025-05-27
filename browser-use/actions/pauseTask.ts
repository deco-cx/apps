import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Task ID
   * @description ID of the running task to pause
   */
  taskId: string;
}

/**
 * @title Pause Task
 * @description Temporarily pause a running browser automation task
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const { taskId } = props;

  await ctx.api["PUT /api/v1/pause-task"](
    {
      task_id: taskId,
    },
  );
};

export default action;

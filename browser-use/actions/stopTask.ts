import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Task ID
   * @description ID of the running task to stop
   */
  taskId: string;
}

/**
 * @title Stop Task
 * @description Immediately stop a running browser automation task
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const { taskId } = props;

  await ctx.api["PUT /api/v1/stop-task"](
    {
      task_id: taskId,
    },
  );
};

export default action;

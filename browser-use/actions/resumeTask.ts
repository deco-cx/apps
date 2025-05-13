import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Task ID
   * @description ID of the paused task to resume
   */
  taskId: string;
}

/**
 * @title Resume Task
 * @description Resume a previously paused browser automation task
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const { taskId } = props;

  await ctx.api["PUT /api/v1/resume-task"](
    {
      task_id: taskId,
    },
  );
};

export default action;

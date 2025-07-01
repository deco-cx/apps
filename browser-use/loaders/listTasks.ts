import { AppContext } from "../mod.ts";
import { ListTasksResponse } from "../client.ts";

export interface Props {
  /**
   * @title Page Number
   * @description Page number for pagination
   * @default 1
   */
  page?: number;

  /**
   * @title Results Per Page
   * @description Number of results to show per page
   * @default 10
   */
  limit?: number;
}

/**
 * @title List Tasks
 * @description Get a paginated list of all tasks
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListTasksResponse> => {
  const { page = 1, limit = 10 } = props;

  const response = await ctx.api["GET /api/v1/tasks"]({
    page,
    limit,
  });

  const result = await response.json();
  return result;
};

export default loader;

import { AppContext } from "../mod.ts";
import { Deployment } from "../client.ts";

interface Props {
  /**
   * @title Project ID
   * @description The ID of the project to fetch deployments from
   */
  projectId: string;

  /**
   * @title Page
   * @description The page number to return
   */
  page?: number;

  /**
   * @title Limit
   * @description The maximum number of items to return per page
   */
  limit?: number;

  /**
   * @title Search Query
   * @description Query by deployment ID
   */
  q?: string;

  /**
   * @title Sort By
   * @description The field to sort by, either 'id' or 'created_at'
   */
  sort?: "id" | "created_at";

  /**
   * @title Order
   * @description Sort order, either 'asc' or 'desc'
   */
  order?: "asc" | "desc";
}

/**
 * @title List Deployments
 * @description List all deployments belonging to a project
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Deployment[]> => {
  const { projectId, page, limit, q, sort, order } = props;

  const response = await ctx.api["GET /projects/:projectId/deployments"]({
    projectId,
    page,
    limit,
    q,
    sort,
    order,
  });

  const result = await response.json();

  return result;
};

export default loader;

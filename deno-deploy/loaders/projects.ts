import { AppContext } from "../mod.ts";
import { Project } from "../client.ts";

interface Props {
  /**
   * @title Organization ID
   * @description The ID of the organization to fetch projects from
   */
  organizationId: string;

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
   * @description Query by project name or project ID
   */
  q?: string;

  /**
   * @title Sort By
   * @description The field to sort by, either 'name' or 'updated_at'
   */
  sort?: "name" | "updated_at";

  /**
   * @title Order
   * @description Sort order, either 'asc' or 'desc'
   */
  order?: "asc" | "desc";
}

/**
 * @title List Projects
 * @description List all projects belonging to an organization
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Project[]> => {
  const { organizationId, page, limit, q, sort, order } = props;

  const response = await ctx.api["GET /organizations/:organizationId/projects"](
    {
      organizationId,
      page,
      limit,
      q,
      sort,
      order,
    },
  );

  const result = await response.json();

  return result;
};

export default loader;

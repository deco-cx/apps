import { AppContext } from "../mod.ts";
import { KvDatabase } from "../client.ts";

interface Props {
  /**
   * @title Organization ID
   * @description The ID of the organization to fetch KV databases from
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
   * @description Query by KV database ID
   */
  q?: string;

  /**
   * @title Sort By
   * @description The field to sort by (currently only 'created_at' is supported)
   */
  sort?: "created_at";

  /**
   * @title Order
   * @description Sort order, either 'asc' or 'desc'
   */
  order?: "asc" | "desc";
}

/**
 * @title List KV Databases
 * @description List all KV databases belonging to an organization
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<KvDatabase[]> => {
  const { organizationId, page, limit, q, sort, order } = props;

  const response = await ctx.api
    ["GET /organizations/:organizationId/databases"]({
      organizationId,
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

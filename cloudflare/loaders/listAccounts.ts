import { AppContext } from "../mod.ts";
import { ListAccountsResponse } from "../client.ts";

export interface Props {
  /**
   * @title Name Filter
   * @description Filter accounts by name
   */
  name?: string;

  /**
   * @title Page
   * @description Page number for pagination (starts at 1)
   */
  page?: number;

  /**
   * @title Per Page
   * @description Number of results per page (between 5 and 50)
   */
  perPage?: number;

  /**
   * @title Direction
   * @description Sort direction for results
   */
  direction?: "asc" | "desc";
}

/**
 * @title List Accounts
 * @description Fetch a list of Cloudflare accounts you have access to
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListAccountsResponse> => {
  const { name, page, perPage, direction } = props;

  // Make API request
  const response = await ctx.api["GET /accounts"]({
    name,
    page,
    per_page: perPage,
    direction,
  });

  const result = await response.json();
  return result;
};

export default loader;

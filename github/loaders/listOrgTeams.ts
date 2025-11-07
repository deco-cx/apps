import { AppContext } from "../mod.ts";
import { StandardResponse } from "../utils/response.ts";

interface Props {
  org: string;
  per_page?: number;
  page?: number;
}

interface Team {
  id?: number;
  node_id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  privacy?: string;
  permission?: string;
  url?: string;
  [key: string]: unknown;
}

/**
 * @name LIST_ORG_TEAMS
 * @title List Organization Teams
 * @ignore 
 * @description List teams for an organization.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<Team>> => {
  const response = await ctx.client["GET /orgs/:org/teams"]({
    org: props.org,
    per_page: props.per_page,
    page: props.page,
  });
  const data = await response.json();
  
  return {
    data,
    metadata: {
      page: props.page,
      per_page: props.per_page,
      has_next_page: props.per_page ? data.length === props.per_page : undefined,
    },
  };
};

export default loader;

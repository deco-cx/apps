import { AppContext } from "../mod.ts";
import { StandardResponse, hasNextPageFromLinkHeader } from "../utils/response.ts";

interface Props {
  org: string;
  per_page?: number;
  page?: number;
}

interface OrgMember {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  type: string;
  site_admin: boolean;
}

/**
 * @name LIST_ORG_MEMBERS
 * @title List Organization Members
 * @description List members for an organization.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<OrgMember>> => {
  const response = await ctx.client["GET /orgs/:org/members"]({
    org: props.org,
    per_page: props.per_page,
    page: props.page,
  });
  const data = await response.json();
  const linkHeader = response.headers.get("link");

  return {
    data,
    metadata: {
      page: props.page,
      per_page: props.per_page,
      has_next_page: hasNextPageFromLinkHeader(linkHeader),
    },
  };
};

export default loader;

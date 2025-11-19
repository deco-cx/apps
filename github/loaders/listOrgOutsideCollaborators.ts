import { AppContext } from "../mod.ts";
import {
  hasNextPageFromLinkHeader,
  StandardResponse,
} from "../utils/response.ts";

interface Props {
  org: string;
  per_page?: number;
  page?: number;
}

interface OutsideCollaborator {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  type: string;
  site_admin: boolean;
}

/**
 * @name LIST_ORG_OUTSIDE_COLLABORATORS
 * @title List Organization Outside Collaborators
 * @ignore
 * @description List outside collaborators for an organization.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<OutsideCollaborator>> => {
  const response = await ctx.client["GET /orgs/:org/outside_collaborators"]({
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

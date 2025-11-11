import { AppContext } from "../mod.ts";
import {
  hasNextPageFromLinkHeader,
  StandardResponse,
} from "../utils/response.ts";

interface Props {
  org: string;
  team_slug: string;
  per_page?: number;
  page?: number;
}

interface TeamMember {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  type: string;
  site_admin: boolean;
}

/**
 * @name LIST_TEAM_MEMBERS
 * @title List Team Members
 * @ignore
 * @description List members for a team in an organization.
 *
 * Pagination: Uses HTTP Link header to detect next page availability,
 * which correctly handles the edge case where the final page is exactly full.
 * Falls back to undefined if Link header is absent, allowing consumers to
 * implement appropriate fallback logic if needed.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<TeamMember>> => {
  const response = await ctx.client["GET /orgs/:org/teams/:team_slug/members"]({
    org: props.org,
    team_slug: props.team_slug,
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

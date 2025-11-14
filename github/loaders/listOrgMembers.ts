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
 *
 * Pagination: Uses HTTP Link header to detect pagination reliably.
 * The has_next_page is set to true ONLY when GitHub advertises a rel="next" link,
 * ensuring clients only fetch additional pages when explicitly provided by the API.
 * This avoids false positives when the final page is exactly per_page items.
 * Missing Link header safely returns undefined, signaling no guaranteed next page.
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

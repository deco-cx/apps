import { AppContext } from "../mod.ts";

interface Props {
  org: string;
  team_slug: string;
  per_page?: number;
  page?: number;
}

/**
 * @name LIST_TEAM_MEMBERS
 * @title List Team Members
 * @description List members for a team in an organization.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client["GET /orgs/:org/teams/:team_slug/members"]({
    org: props.org,
    team_slug: props.team_slug,
    per_page: props.per_page,
    page: props.page,
  });
  return await response.json();
};

export default loader;

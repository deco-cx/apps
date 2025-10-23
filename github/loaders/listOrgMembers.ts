import { AppContext } from "../mod.ts";

interface Props {
  org: string;
  per_page?: number;
  page?: number;
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
) => {
  const response = await ctx.client["GET /orgs/:org/members"]({
    org: props.org,
    per_page: props.per_page,
    page: props.page,
  });
  return await response.json();
};

export default loader;

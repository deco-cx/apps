import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
  anon?: boolean;
  per_page?: number;
  page?: number;
}

/**
 * @name LIST_REPO_CONTRIBUTORS
 * @title List Repository Contributors
 * @description List contributors for a repository with contribution counts.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client["GET /repos/:owner/:repo/contributors"]({
    owner: props.owner,
    repo: props.repo,
    anon: props.anon ? "true" : undefined,
    per_page: props.per_page,
    page: props.page,
  });
  return await response.json();
};

export default loader;

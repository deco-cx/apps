import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
  affiliation?: "outside" | "direct" | "all";
  per_page?: number;
  page?: number;
}

/**
 * @name LIST_REPO_COLLABORATORS
 * @title List Repository Collaborators
 * @description List collaborators for a repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client["GET /repos/:owner/:repo/collaborators"]({
    owner: props.owner,
    repo: props.repo,
    affiliation: props.affiliation,
    per_page: props.per_page,
    page: props.page,
  });
  return await response.json();
};

export default loader;

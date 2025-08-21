import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
  branch: string;
}

/**
 * @name GET_BRANCH_PROTECTION
 * @title Get Branch Protection
 * @description Get branch protection rules for a branch.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/branches/:branch/protection"]({
      owner: props.owner,
      repo: props.repo,
      branch: props.branch,
    });
  return await response.json();
};

export default loader;

import { AppContext } from "../mod.ts";
import { SingleObjectResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
  branch: string;
}

type BranchProtection = Record<string, unknown>;

/**
 * @name GET_BRANCH_PROTECTION
 * @title Get Branch Protection
 * @description Get branch protection rules for a branch.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SingleObjectResponse<BranchProtection>> => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/branches/:branch/protection"]({
      owner: props.owner,
      repo: props.repo,
      branch: props.branch,
    });
  const data = await response.json();

  return {
    data,
    metadata: {},
  };
};

export default loader;

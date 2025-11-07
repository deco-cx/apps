import { AppContext } from "../mod.ts";
import { SingleObjectResponse } from "../utils/response.ts";

export interface Props {
  owner: string;
  repo: string;
  pull_number: number;
}

type PullRequestDetail = Record<string, unknown>;

/**
 * @name GET_PULL_REQUEST
 * @title Get Pull Request
 * @description Get a pull request by its number with detailed information including merge status, commits, and changes.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SingleObjectResponse<PullRequestDetail>> => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/pulls/:pull_number"](props);
  const data = await response.json();

  return {
    data,
    metadata: {},
  };
};

export default loader;

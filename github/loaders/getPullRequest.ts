import { AppContext } from "../mod.ts";

export interface Props {
  owner: string;
  repo: string;
  pull_number: number;
}

/**
 * @name GET_PULL_REQUEST
 * @title Get Pull Request
 * @description Get a pull request by its number with detailed information including merge status, commits, and changes.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/pulls/:pull_number"](props);
  return await response.json();
};

export default loader;

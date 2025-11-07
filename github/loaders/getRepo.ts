import { AppContext } from "../mod.ts";
import type { Repository } from "../utils/types.ts";
import { SingleObjectResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
}

type RepoDetails = Repository & {
  default_branch?: string;
  archived?: boolean;
  open_issues_count?: number;
  subscribers_count?: number;
  stargazers_count?: number;
  forks_count?: number;
  created_at?: string;
  updated_at?: string;
  pushed_at?: string;
  language?: string | null;
  size?: number;
  topics?: string[];
  license?: { key: string; name: string } | null;
};

/**
 * @name GET_REPO
 * @title Get Repository
 * @description Get detailed metadata for a repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SingleObjectResponse<RepoDetails>> => {
  const response = await ctx.client["GET /repos/:owner/:repo"](props);
  const data = await response.json();

  return {
    data,
    metadata: {},
  };
};

export default loader;

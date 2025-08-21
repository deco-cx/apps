import { AppContext } from "../mod.ts";
import type { Repository } from "../utils/types.ts";

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
): Promise<RepoDetails> => {
  const response = await ctx.client["GET /repos/:owner/:repo"](props);
  return await response.json();
};

export default loader;

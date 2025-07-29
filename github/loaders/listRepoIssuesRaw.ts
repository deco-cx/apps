import { AppContext } from "../mod.ts";
import type { Client } from "../utils/client.ts";

export interface Props {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";
  per_page?: number;
  page?: number;
  labels?: string;
  sort?: "created" | "updated" | "comments";
  direction?: "asc" | "desc";
  since?: string;
  assignee?: string;
  creator?: string;
  mentioned?: string;
  milestone?: string | number;
}

/**
 * @name LIST_REPO_ISSUES_RAW
 * @title Repository Issues (and Pull Requests)
 * @description List repository issues and pull requests
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ data: Client["GET /repos/:owner/:repo/issues"]["response"] }> => {
  const response = await ctx.client["GET /repos/:owner/:repo/issues"](props);
  const data = await response.json();
  return { data };
};

export default loader;

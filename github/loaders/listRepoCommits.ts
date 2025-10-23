import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
  since?: string;
  until?: string;
  per_page?: number;
  page?: number;
}

/**
 * @name LIST_REPO_COMMITS
 * @title List Repository Commits
 * @description List commits for a repository; optionally filter by time window.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client["GET /repos/:owner/:repo/commits"]({
    owner: props.owner,
    repo: props.repo,
    since: props.since,
    until: props.until,
    per_page: props.per_page,
    page: props.page,
  });
  return await response.json();
};

export default loader;

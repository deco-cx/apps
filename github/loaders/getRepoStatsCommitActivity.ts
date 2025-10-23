import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
}

/**
 * @name GET_REPO_STATS_COMMIT_ACTIVITY
 * @title Get Repo Stats Commit Activity
 * @description Weekly commit activity for the last year. GitHub may return 202 until stats are ready.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/stats/commit_activity"](props);
  if (response.status === 202) {
    return { status: 202 };
  }
  return await response.json();
};

export default loader;

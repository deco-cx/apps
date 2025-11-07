import { AppContext } from "../mod.ts";
import { StandardResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
}

interface WeeklyCommitActivity {
  days: number[];
  total: number;
  week: number;
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
): Promise<StandardResponse<WeeklyCommitActivity> | { status: 202 }> => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/stats/commit_activity"](props);
  if (response.status === 202) {
    return { status: 202 };
  }
  const data = await response.json();

  return {
    data,
    metadata: {},
  };
};

export default loader;

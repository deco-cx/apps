import { AppContext } from "../mod.ts";
import { StandardResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
}

/**
 * @name GET_REPO_TOPICS
 * @title Get Repository Topics
 * @description Get repository topics.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<string>> => {
  const response = await ctx.client["GET /repos/:owner/:repo/topics"](props);
  const result = await response.json() as { names: string[] };

  return {
    data: result.names,
    metadata: {},
  };
};

export default loader;

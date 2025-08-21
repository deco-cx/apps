import { AppContext } from "../mod.ts";

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
): Promise<{ names: string[] }> => {
  const response = await ctx.client["GET /repos/:owner/:repo/topics"](props);
  return await response.json();
};

export default loader;

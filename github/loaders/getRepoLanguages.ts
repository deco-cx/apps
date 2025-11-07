import { AppContext } from "../mod.ts";
import { SingleObjectResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
}

/**
 * @name GET_REPO_LANGUAGES
 * @title Get Repository Languages
 * @description Get the programming languages used in a repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SingleObjectResponse<Record<string, number>>> => {
  const response = await ctx.client["GET /repos/:owner/:repo/languages"](props);
  const data = await response.json();

  return {
    data,
    metadata: {},
  };
};

export default loader;

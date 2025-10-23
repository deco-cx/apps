import { AppContext } from "../mod.ts";

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
) => {
  const response = await ctx.client["GET /repos/:owner/:repo/languages"](props);
  return await response.json();
};

export default loader;

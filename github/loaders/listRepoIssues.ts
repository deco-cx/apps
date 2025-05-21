import { AppContext } from "../mod.ts";
import type { Issue } from "../utils/types.ts";

interface Props {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";
  sort?: "created" | "updated" | "comments";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

/**
 * @name LIST_REPO_ISSUES
 * @title Listar Issues de um Repositório
 * @description Lista as issues de um repositório específico no GitHub.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Issue[]> => {
  const { owner, repo, ...params } = props;

  const response = await ctx.client["GET /repos/:owner/:repo/issues"]({
    owner,
    repo,
    ...params,
  });

  const json = await response.json();

  return json;
};

export default loader;

import { AppContext } from "../mod.ts";
import {
  hasNextPageFromLinkHeader,
  StandardResponse,
} from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
  per_page?: number;
  page?: number;
}

interface RepoTeam {
  id?: number;
  node_id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  privacy?: string;
  permission?: string;
  url?: string;
  [key: string]: unknown;
}

/**
 * @name LIST_REPO_TEAMS
 * @title List Repository Teams
 * @ignore
 * @description List teams with access to a repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<RepoTeam>> => {
  const response = await ctx.client["GET /repos/:owner/:repo/teams"]({
    owner: props.owner,
    repo: props.repo,
    per_page: props.per_page,
    page: props.page,
  });
  const data = await response.json();
  const linkHeader = response.headers.get("link");

  return {
    data,
    metadata: {
      page: props.page,
      per_page: props.per_page,
      has_next_page: hasNextPageFromLinkHeader(linkHeader),
    },
  };
};

export default loader;

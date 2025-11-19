import { AppContext } from "../mod.ts";
import {
  hasNextPageFromLinkHeader,
  StandardResponse,
} from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";
  per_page?: number;
  page?: number;
}

type PullRequest = Record<string, unknown>;

/**
 * @name LIST_REPO_PULLS
 * @title List Repository Pull Requests
 * @description List pull requests for a repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<PullRequest>> => {
  const response = await ctx.client["GET /repos/:owner/:repo/pulls"]({
    owner: props.owner,
    repo: props.repo,
    state: props.state,
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

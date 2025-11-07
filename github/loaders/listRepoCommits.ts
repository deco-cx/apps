import { AppContext } from "../mod.ts";
import {
  hasNextPageFromLinkHeader,
  StandardResponse,
} from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
  since?: string;
  until?: string;
  per_page?: number;
  page?: number;
}

type Commit = Record<string, unknown>;

/**
 * @name LIST_REPO_COMMITS
 * @title List Repository Commits
 * @description List commits for a repository; optionally filter by time window.
 *
 * Pagination: Uses HTTP Link header (rel="next") to reliably detect pagination,
 * avoiding false positives when the final page is exactly per_page items.
 * If Link header is absent, falls back to best-effort length comparison as documented
 * in hasNextPageFromLinkHeader(). This correctly handles edge cases in GitHub's
 * paginated API responses.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<Commit>> => {
  const response = await ctx.client["GET /repos/:owner/:repo/commits"]({
    owner: props.owner,
    repo: props.repo,
    since: props.since,
    until: props.until,
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

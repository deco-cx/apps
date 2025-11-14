import { AppContext } from "../mod.ts";
import {
  hasNextPageFromLinkHeader,
  StandardResponse,
} from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
  anon?: boolean;
  per_page?: number;
  page?: number;
}

type Contributor = Record<string, unknown>;

/**
 * @name LIST_REPO_CONTRIBUTORS
 * @title List Repository Contributors
 * @description List contributors for a repository with contribution counts.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<Contributor>> => {
  const response = await ctx.client["GET /repos/:owner/:repo/contributors"]({
    owner: props.owner,
    repo: props.repo,
    anon: props.anon ? "true" : undefined,
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

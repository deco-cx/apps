import { AppContext } from "../mod.ts";
import {
  hasNextPageFromLinkHeader,
  StandardResponse,
} from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
  affiliation?: "outside" | "direct" | "all";
  per_page?: number;
  page?: number;
}

type Collaborator = Record<string, unknown>;

/**
 * @name LIST_REPO_COLLABORATORS
 * @title List Repository Collaborators
 * @description List collaborators for a repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<Collaborator>> => {
  const response = await ctx.client["GET /repos/:owner/:repo/collaborators"]({
    owner: props.owner,
    repo: props.repo,
    affiliation: props.affiliation,
    per_page: props.per_page,
    page: props.page,
  });
  const data = await response.json() as unknown as Collaborator[];
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

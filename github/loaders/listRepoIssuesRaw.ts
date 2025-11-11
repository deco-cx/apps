import { AppContext } from "../mod.ts";
import type { Client } from "../utils/client.ts";
import {
  hasNextPageFromLinkHeader,
  ResponseMetadata,
} from "../utils/response.ts";

export interface Props {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";
  per_page?: number;
  page?: number;
  labels?: string;
  sort?: "created" | "updated" | "comments";
  direction?: "asc" | "desc";
  since?: string;
  assignee?: string;
  creator?: string;
  mentioned?: string;
  milestone?: string | number;
}

type IssuesResponse = Client["GET /repos/:owner/:repo/issues"]["response"];

/**
 * @name LIST_REPO_ISSUES_RAW
 * @title Repository Issues (and Pull Requests)
 * @description List repository issues and pull requests
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ data: IssuesResponse; metadata: ResponseMetadata }> => {
  const response = await ctx.client["GET /repos/:owner/:repo/issues"](props);
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

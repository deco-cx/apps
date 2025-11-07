import { AppContext } from "../mod.ts";
import type { GistSimple } from "../utils/types.ts";
import {
  hasNextPageFromLinkHeader,
  StandardResponse,
} from "../utils/response.ts";

interface Props {
  since?: string;
  per_page?: number;
  page?: number;
}

/**
 * @name LIST_PUBLIC_GISTS
 * @title List Public Gists
 * @description List all public gists on GitHub.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<GistSimple>> => {
  const response = await ctx.client["GET /gists/public"]({
    ...props,
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

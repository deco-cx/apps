import { AppContext } from "../mod.ts";
import type { GistSimple } from "../utils/types.ts";
import { SingleObjectResponse } from "../utils/response.ts";

interface Props {
  description?: string;
  public: boolean;
  files: Record<string, { content: string }>;
}

/**
 * @name CREATE_GIST
 * @title Create Gist
 * @description Create a new gist on GitHub.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SingleObjectResponse<GistSimple>> => {
  const response = await ctx.client["POST /gists"]({}, { body: props });
  const data = await response.json();

  return {
    data,
    metadata: {},
  };
};

export default action;

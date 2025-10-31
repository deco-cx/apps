import { AppContext } from "../mod.ts";
import type { GistSimple } from "../utils/types.ts";

interface Props {
  since?: string;
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
): Promise<{ data: GistSimple[] }> => {
  const response = await ctx.client["GET /gists/public"]({
    ...props,
  });
  const data = await response.json();
  return { data };
};

export default loader;

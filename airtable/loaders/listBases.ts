import type { AppContext } from "../mod.ts";
import type { ListBasesResponse } from "../types.ts";

interface Props {
  // If the API supports pagination for bases via offset, it could be a prop here.
  // For now, let's assume we fetch all or the first page as per client default.
  offset?: string;
  /**
   * @title API Key
   */
  apiKey?: string;
}

/**
 * @title List Airtable Bases
 * @description Fetches a list of bases accessible with the configured API key.
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ListBasesResponse | Response> => {
  const { apiKey, offset } = props;

  const authHeader = req.headers.get("Authorization")?.split(" ")[1];
  const resolvedApiKey = authHeader || apiKey;

  if (!resolvedApiKey) {
    return new Response("API Key is required", { status: 403 });
  }

  const response = await ctx.api(resolvedApiKey)["GET /v0/meta/bases"](
    offset ? { offset: offset } : {},
  );

  if (!response.ok) {
    throw new Error(`Error listing bases: ${response.statusText}`);
  }

  return response.json();
};

export default loader;

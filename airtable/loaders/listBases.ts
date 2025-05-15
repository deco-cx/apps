import type { AppContext } from "../mod.ts";
import type { ListBasesResponse } from "../types.ts";

interface Props {
  // If the API supports pagination for bases via offset, it could be a prop here.
  // For now, let's assume we fetch all or the first page as per client default.
  offset?: string;
}

/**
 * @title List Airtable Bases
 * @description Fetches a list of bases accessible with the configured API key.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListBasesResponse> => {
  const response = await ctx.api["GET /v0/meta/bases"](
    props.offset ? { offset: props.offset } : {},
  );

  if (!response.ok) {
    throw new Error(`Error listing bases: ${response.statusText}`);
  }

  return response.json();
};

export default loader;

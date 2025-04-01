import type { AppContext } from "../../mod.ts";
import type { GetViewsParams, GrainView } from "../../client.ts";

// Use the GetViewsParams interface directly for Props
export type Props = GetViewsParams;

/**
 * @name GetViews
 * @title List Views
 * @description Fetches a list of views (saved filters) accessible by the authenticated user. Supports pagination and type filtering.
 */
export default async function listViews(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ views: GrainView[]; cursor: string | null }> {
  return await ctx.grain.getViews(props);
}

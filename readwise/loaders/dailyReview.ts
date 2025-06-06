import { AppContext } from "../mod.ts";
import type { DailyReviewResponse } from "../client.ts";

/**
 * @title Daily Review
 * @description Fetches your daily review highlights from Readwise
 */
const loader = async (
  _props: Record<string, never>,
  _req: Request,
  ctx: AppContext,
): Promise<DailyReviewResponse> => {
  // No parameters needed for this endpoint
  const response = await ctx.api["GET /review/"]({});
  const data = await response.json();

  return data;
};

export default loader;

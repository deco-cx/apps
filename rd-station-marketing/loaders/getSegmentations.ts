import { AppContext } from "../mod.ts";
import { SegmentationsResponse } from "../client.ts";

/**
 * @title Get All Segmentations
 * @description Retrieves all segmentations from RD Station Marketing
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<SegmentationsResponse> => {
  const response = await ctx.api["GET /platform/segmentations"]({});
  const result = await response.json();

  return result;
};

export default loader;

import { AppContext } from "../../mod.ts";
import { AnchorText, DataForSeoTaskResponse } from "../../client.ts";

export interface Props {
  /**
   * @title Target
   * @description Domain or URL to analyze anchor texts
   */
  target: string;

  /**
   * @title Limit
   * @description Maximum number of anchors to return
   * @default 100
   */
  limit?: number;

  /**
   * @title Offset
   * @description Offset for pagination
   * @default 0
   */
  offset?: number;
}

/**
 * @title DataForSEO - Backlinks Anchors
 * @description Get anchor text distribution for a domain's backlink profile
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AnchorText[]> => {
  const { target, limit = 100, offset = 0 } = props;

  const response = await ctx.client["POST /backlinks/anchors/live"](
    {},
    {
      body: [{
        target,
        limit,
        offset,
      }],
    },
  );

  const data = await response.json() as DataForSeoTaskResponse;

  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO API Error: ${data.status_message}`);
  }

  if (data.tasks?.[0]?.result?.[0]) {
    const result = data.tasks[0].result[0] as { items?: AnchorText[] };
    return result.items || [];
  }

  return [];
};

export default loader;

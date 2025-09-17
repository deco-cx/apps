import { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Target
   * @description Domain or URL to analyze referring domains
   */
  target: string;

  /**
   * @title Limit
   * @description Maximum number of domains to return
   */
  limit?: number;

  /**
   * @title Offset
   * @description Offset for pagination
   */
  offset?: number;

  /**
   * @title Order By
   * @description Sort results by specific metric
   */
  order_by?: string;
}

/**
 * @name BACKLINKS_REFERRING_DOMAINS_LIVE
 * @title Get Referring Domains
 * @description Get list of domains linking to the target
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["POST /backlinks/referring_domains/live"](
    {},
    {
      body: [{
        target: props.target,
        limit: props.limit,
        offset: props.offset,
        order_by: props.order_by ? [props.order_by] : undefined,
      }],
    },
  );
  return await handleDataForSeoResponse(response, "Referring Domains");
}

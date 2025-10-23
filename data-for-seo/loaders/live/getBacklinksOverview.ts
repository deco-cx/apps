import { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Target
   * @description Target domain or URL to analyze backlinks
   */
  target: string;
}

/**
 * @name BACKLINKS_DOMAIN_INFO
 * @title Get Backlinks Domain Info
 * @description Get backlinks overview data for a domain
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["POST /backlinks/domain_info/live"](
    {},
    {
      body: [{
        target: props.target,
      }],
    },
  );
  return await handleDataForSeoResponse(response, "Backlinks Overview");
}

import { Auction } from "../../utils/types/auctionAPI.ts";
import type { AppContext } from "../../../linx/mod.ts";
import { cleanResponse } from "../../../utils/http.ts";
import { logger } from "@deco/deco/o11y";

/**
 * @title Linx Integration
 * @description Search Wishlist loader
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Auction[] | null> => {
  const { layer } = ctx;

  const responsePromise = await layer
    ["POST /v1/Catalog/API.svc/web/SearchProductAuctions"](
      {},
      // @ts-ignore body is required
      { body: {} },
    );

  const response = await cleanResponse<Auction[]>(responsePromise);

  if (typeof response !== "object") {
    logger.error(`Failed to parse response from linx as JSON: ${response}`);
    return null;
  }

  return response;
};

// export const cache = "stale-while-revalidate";

// export const cacheKey = (_props: unknown, req: Request, _ctx: AppContext) => {
//   const url = new URL(req.url);
//   url.pathname = "/v1/Catalog/API.svc/web/SearchProductAuctions";
//   return url.href;
// };

export default loader;

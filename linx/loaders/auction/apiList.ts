import { Auction } from "../../utils/types/auctionAPI.ts";
import type { AppContext } from "../../../linx/mod.ts";

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

  return await responsePromise.json();
};

export const cache = "stale-while-revalidate";

export const cacheKey = (_props: unknown, req: Request, _ctx: AppContext) => {
  const url = new URL(req.url);
  url.pathname = "/v1/Catalog/API.svc/web/SearchProductAuctions";
  return url.href;
};

export default loader;

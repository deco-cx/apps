import { Auction } from "../../utils/types/auctionAPI.ts";
import type { AppContext } from "../../../linx/mod.ts";

let cachedPromise: Promise<Auction[]> | null = null;
let lastUpdate: number = Date.now();
/**
 * @title Linx Integration
 * @description Search Wishlist loader
 */
const loader = (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Auction[] | null> => {
  const { layer } = ctx;

  if (cachedPromise && Date.now() - lastUpdate < (60 * 1000)) {
    return cachedPromise;
  }

  lastUpdate = Date.now();
  const responsePromise = layer
    ["POST /v1/Catalog/API.svc/web/SearchProductAuctions"](
      {},
      // @ts-ignore body is required
      { body: {} },
    ).then(async (response) => {
      return await response.json();
    });

  cachedPromise = responsePromise;
  return responsePromise;
};

export const cache = "stale-while-revalidate";

export const cacheKey = (_props: unknown, req: Request, _ctx: AppContext) => {
  const url = new URL(req.url);
  url.pathname = "/v1/Catalog/API.svc/web/SearchProductAuctions";
  return url.href;
};

export default loader;

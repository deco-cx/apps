import type { AppContext } from "../../../linx/mod.ts";
import { nullOnNotFound } from "../../../utils/http.ts";
import { isAuctionDetailModel } from "../../utils/paths.ts";
import { toAuctionDetail } from "../../utils/transform.ts";
import { Model as AuctionDetail } from "../../utils/types/auctionDetailJSON.ts";

/**
 * @title Linx Integration
 * @description Product Auction Detail loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<AuctionDetail | null> => {
  const { api, cdn } = ctx;
  const upstream = new URL(req.url);
  const splat = upstream.pathname.slice(1);

  const response = await api["GET /*splat"]({
    splat,
  }, {
    headers: req.headers,
  }).catch(nullOnNotFound);

  if (response === null) {
    return null;
  }

  // deno-lint-ignore no-explicit-any
  let auction: any;
  try {
    auction = await response.json();
  } catch (_error) {
    auction = null;
  }

  if (!auction || !isAuctionDetailModel(auction)) {
    return null;
  }

  return toAuctionDetail(auction.Model, { cdn });
};

export default loader;

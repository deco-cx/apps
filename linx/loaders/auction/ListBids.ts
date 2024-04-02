import type { AppContext } from "../../../linx/mod.ts";
import { nullOnNotFound } from "../../../utils/http.ts";
// import { isListBids } from "../../utils/paths.ts";
// import { toListBids } from "../../utils/transform.ts";
import { Bids } from "../../utils/types/ListBidsJSON.ts";

/**
 * @title Linx Integration
 * @description List Bids Auction
 */

export interface Props {
  ProductAuctionID: number;
}

const bidsloader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Bids | null> => {
  const { api, cdn } = ctx;
  const upstream = new URL(req.url);

  const response = await api["GET /Shopping/ProductAuction/ListBids"]({
    ...props,
  }).catch(nullOnNotFound);

  if (response === null) {
    return null;
  }

  const auction = await response.json();

  //   if (!auction || !isListBids(auction)) {
  //     throw new Error("Auction detail page returned another model than Auction");
  //   }

  //   return toListBids(auction.Model, { cdn });

  return (auction.Bids);
};

export default bidsloader;

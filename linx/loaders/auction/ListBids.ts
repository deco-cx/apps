import type { AppContext } from "../../../linx/mod.ts";
import { nullOnNotFound } from "../../../utils/http.ts";
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
  _req: Request,
  ctx: AppContext,
): Promise<Bids | null> => {
  const { api } = ctx;

  const response = await api["GET /Shopping/ProductAuction/ListBids"]({
    ...props,
  }).catch(nullOnNotFound);

  if (response === null) {
    return null;
  }

  const auction = await response.json();

  return auction.Bids;
};

export default bidsloader;

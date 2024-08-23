import type { AppContext } from "../../../linx/mod.ts";
import { nullOnNotFound } from "../../../utils/http.ts";
import { isAuctionModel } from "../../utils/paths.ts";
import { toAuction, toFilters } from "../../utils/transform.ts";
import { AuctionListingPage } from "../../utils/types/auction.ts";

/**
 * @title Linx Integration
 * @description Product Auctions loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<AuctionListingPage | null> => {
  const { api, cdn } = ctx;

  const url = new URL(req.url);
  const splat = `leilao.json?${url.searchParams.toString()}`;

  const response = await api["GET /*splat"]({ splat }).catch(nullOnNotFound);

  if (response === null) {
    return null;
  }

  const auctions = await response.json();

  if (!auctions || !isAuctionModel(auctions)) {
    throw new Error("/leilao.json returned another model than Auction");
  }

  const products = auctions.Model.ProductAuctions.map((auction) =>
    toAuction(auction, { cdn })
  );
  const facets = toFilters(auctions.Model.Grid.Facets, url);
  const pageCount = auctions.Model.Grid.PageCount;
  const pageNumber = auctions.Model.Grid.PageNumber;
  const pageIndex = auctions.Model.Grid.PageIndex;

  return {
    products,
    facets,
    pageCount,
    pageIndex,
    pageNumber,
  };
};

export default loader;

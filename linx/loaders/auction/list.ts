import type { AppContext } from "../../../linx/mod.ts";
import { nullOnNotFound } from "../../../utils/http.ts";
import { isAuctionModel } from "../../utils/paths.ts";
import { toAuction } from "../../utils/transform.ts";
import { ProductAuction } from "../../utils/types/auctionJSON.ts";

/**
 * @title Linx Integration
 * @description Product Auctions loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<ProductAuction[] | null> => {
  const { api, cdn } = ctx;
  
  const url = new URL(req.url);
  const splat = `leilao.json?${url.searchParams.toString()}`;

  const response = await api["GET /*splat"]({ splat }, {
    headers: req.headers,
  }).catch(nullOnNotFound);

  if (response === null) {
    return null;
  }

  const auctions = await response.json();

  if (!auctions || !isAuctionModel(auctions)) {
    throw new Error("/leilao.json returned another model than Auction");
  }

  const produtos = auctions.Model.ProductAuctions.map((auction) =>
    toAuction(auction, { cdn })
  );
  const facetas = auctions.Model.Grid.Facets;
  const pagecount = auctions.Model.Grid.PageCount;
  const pagenumber = auctions.Model.Grid.PageNumber;
  const pageindex = auctions.Model.Grid.PageIndex;

  return{
    produtos: produtos,
    facetas: facetas,
    pagecount: pagecount,
    pagenumber: pagenumber,
    pageindex: pageindex
  };
};

export default loader;

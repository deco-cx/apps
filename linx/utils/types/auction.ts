export { type ProductAuction } from "./auctionJSON.ts";
import { Filter } from "../../../commerce/types.ts";
import { ProductAuction } from "./auctionJSON.ts";

export interface AuctionListingPage {
  products: ProductAuction[];
  facets: Filter[];
  pageCount: number;
  pageIndex: number;
  pageNumber: number;
}

export { type ProductAuction } from "./auctionJSON.ts";
import { Facet, ProductAuction } from "./auctionJSON.ts";

export interface AuctionListingPage {
  products: ProductAuction[];
  facets: Facet[];
  pageCount: number;
  pageIndex: number;
  pageNumber: number;
}

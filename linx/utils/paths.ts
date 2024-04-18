import { API } from "./client.ts";
import { WebPage as ProductWebPage } from "./types/productJSON.ts";
import { WebPage as GridProductsWebPage } from "./types/gridProductsJSON.ts";
import { WebPage as SuggestionsWebPage } from "./types/suggestionsJSON.ts";
import { WebPage as AuctionWebPage } from "./types/auctionJSON.ts";
import { WebPage as AuctionDetailWebPage } from "./types/auctionDetailJSON.ts";

export const isProductModel = (
  page: API["GET /*splat"]["response"],
): page is ProductWebPage => page.PageInfo.RouteClass.includes("-product-");

export const isGridProductsModel = (
  page: API["GET /*splat"]["response"],
): page is GridProductsWebPage =>
  page.PageInfo.SectionClass === "grid-products";

export const isSuggestionModel = (
  page: API["GET /*splat"]["response"],
): page is SuggestionsWebPage =>
  page.PageInfo.RouteClass === "SearchSuggestRoute";

export const isAuctionModel = (
  page: API["GET /*splat"]["response"],
): page is AuctionWebPage => page.PageInfo.RouteClass === "ProductAuctionRoute";

export const isAuctionDetailModel = (
  page: API["GET /*splat"]["response"],
): page is AuctionDetailWebPage =>
  page.PageInfo.RouteClass === "ProductAuctionDetailRoute";

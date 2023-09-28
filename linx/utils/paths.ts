import { API } from "./client.ts";
import { WebPage as ProductWebPage } from "./types/productJSON.ts";
import { WebPage as GridProductsWebPage } from "./types/gridProductsJSON.ts";
import { WebPage as BasketWebPage } from "./types/basketJSON.ts";
import { WebPage as SuggestionsWebPage } from "./types/suggestionsJSON.ts";

export const isProductModel = (
  page: API["GET /*splat"]["response"],
): page is ProductWebPage => page.PageInfo.RouteClass.includes("-product-");

export const isGridProductsModel = (
  page: API["GET /*splat"]["response"],
): page is GridProductsWebPage =>
  page.PageInfo.SectionClass === "grid-products";

export const isBasketModel = (
  page: API["GET /*splat"]["response"],
): page is BasketWebPage => page.PageInfo.RouteClass === "BasketIndexRoute";

export const isSuggestionModel = (
  page: API["GET /*splat"]["response"],
): page is SuggestionsWebPage =>
  page.PageInfo.RouteClass === "SearchSuggestRoute";

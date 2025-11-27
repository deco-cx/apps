import type { Person } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { getDeviceIdFromBag } from "../../utils/deviceId.ts";
import getSource from "../../utils/source.ts";
import type { SortBy } from "../../utils/types/linx.ts";
import {
  HotsiteResponse,
  NavigateResponse,
  NotFoundResponse,
  SearchResponse,
} from "../../utils/types/search.ts";

export interface Props {
  /**
   * @description overides the query term
   */
  terms?: string;
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  resultsPerPage: number;

  /**
   * @title Sorting
   */
  sort?: SortBy;

  /**
   * @title Hide Unavailable Items
   * @description Do not return out of stock items
   */
  showOnlyAvailable?: boolean;

  /**
   * @title Allow Results Redirect
   * @description Allows the redirect of queries. If false, the API will return results for the term sought even if there is registration of redirects on the dashboard for this term.
   */
  allowRedirect?: boolean;

  /**
   * @title User
   * @description Used to sync user data with linx impulse
   */
  user: Person | null;
  /**
   * @title Force Source
   * @description Force the source of the request
   */
  forceSource?: "desktop" | "mobile";

  /**
   * @ignore
   */
  page?: number;
  /**
   * @ignore
   */
  multicategories?: string[];
  /**
   * @ignore
   */
  categories?: string[];
}

const getSortFromQuery = (query: string): SortBy | undefined => {
  switch (query) {
    case "relevance:desc":
      return "relevance";
    case "price:desc":
      return "descPrice";
    case "price:asc":
      return "ascPrice";
    case "orders:desc":
      return "descSold";
    case "release:desc":
      return "descDate";
    case "discount:desc":
      return "descDiscount";

    case "relevance":
    case "pid":
    case "ascPrice":
    case "descPrice":
    case "descDate":
    case "ascSold":
    case "descSold":
    case "ascReview":
    case "descReview":
    case "descDiscount":
      return query;

    case "name:desc":
    case "name:asc":
    default:
      return undefined;
  }
};

export interface LinxEngage {
  response:
    | NavigateResponse
    | SearchResponse
    | HotsiteResponse
    | NotFoundResponse;
  params: {
    searchTerm?: string;
    page: number;
    resultsPerPage: number;
    url: string;
    cdn?: string;
    pageType?: "Search" | "Category" | "SubCategory";
    category: string[];
    multicategory: string[];
  };
}

/**
 * @title Linx Impulse Engage Data
 * @description For use at /lxsearch Product Listing Page loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<LinxEngage | null> => {
  if (req.url.includes("_frsh")) {
    return null;
  }

  const {
    resultsPerPage,
    allowRedirect,
    showOnlyAvailable,
    user,
    forceSource,
  } = props;
  const { apiKey, salesChannel, api, cdn } = ctx;
  const deviceId = getDeviceIdFromBag(ctx);
  const source = forceSource ?? getSource(ctx);
  const url = new URL(req.url);

  const origin = url.searchParams.get("origin") || undefined;
  const ranking = url.searchParams.get("ranking") || undefined;
  const p = url.searchParams.get("p") || undefined;
  const topsearch = url.searchParams.get("topsearch") || undefined;

  const category = props.categories && props.categories.length > 0
    ? props.categories
    : url.pathname.split("/").filter((x) => x);
  const multicategory =
    props.multicategories && props.multicategories.length > 0
      ? props.multicategories
      : url.searchParams.getAll("multicategory");
  const searchTerm = props.terms || url.searchParams.get("q");

  const page = props.page ||
    Number.parseInt(url.searchParams.get("page") || "1");
  const sortBy = getSortFromQuery(url.searchParams.get("sort") ?? "") ||
    props.sort;
  const fields = url.searchParams.getAll("fields");
  const filter = url.searchParams.getAll("filter");
  const userId = user?.["@id"];
  const productFormat = "complete";
  const categories = url.pathname.slice(1).split("/");
  const pageType = searchTerm
    ? "Search"
    : categories.length === 1
    ? "Category"
    : "SubCategory";

  if (searchTerm) {
    const response = await api["GET /engage/search/v3/search"]({
      apiKey,
      origin,
      salesChannel,
      deviceId,
      allowRedirect,
      showOnlyAvailable,
      resultsPerPage,
      page,
      sortBy,
      filter,
      source,
      terms: searchTerm,
      userId,
      productFormat,
      ranking,
      p,
      topsearch,
    })
      .then((res) => res.json())
      .catch((error) => {
        if (error.status === 404) {
          const errorData = JSON.parse(error.message);
          try {
            if (errorData) {
              return errorData as NotFoundResponse;
            }
          } catch {
            return null;
          }
        }

        throw error;
      });

    if (!response || "code" in response) {
      return response
        ? {
          response,
          params: {
            searchTerm,
            page,
            resultsPerPage,
            url: req.url,
            cdn,
            pageType,
            category,
            multicategory,
          },
        }
        : null;
    }

    return {
      response,
      params: {
        searchTerm,
        page,
        resultsPerPage,
        url: req.url,
        cdn,
        pageType,
        category,
        multicategory,
      },
    };
  } else if (category.length > 0 || multicategory.length > 0) {
    const response = await api["GET /engage/search/v3/navigates"]({
      apiKey,
      origin,
      salesChannel,
      deviceId,
      allowRedirect,
      showOnlyAvailable,
      resultsPerPage,
      page,
      sortBy,
      fields,
      filter,
      source,
      userId,
      productFormat,
      ranking,
      p,
      topsearch,
      ...(multicategory.length > 0 ? { multicategory } : { category }),
    }).then((res) => res.json());

    return {
      response,
      params: {
        page,
        resultsPerPage,
        url: req.url,
        cdn,
        pageType,
        category,
        multicategory,
      },
    };
  } else {
    return null;
  }
};

export default loader;

import type { Person, ProductListingPage } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { getDeviceIdFromBag } from "../../utils/deviceId.ts";
import getSource from "../../utils/source.ts";
import { toProductListingPage } from "../../utils/transform.ts";
import type { SortBy } from "../../utils/types/linx.ts";

export interface Props {
  hotsiteName: string;
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
   * @title User
   * @description Used to sync user data with linx impulse
   */
  user: Person | null;

  /**
   * @ignore
   */
  page?: number;
}

const getSortFromQuery = (query: string): SortBy | undefined => {
  switch (query) {
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
    default:
      return undefined;
  }
};

/**
 * @title Linx Impulse - Hotsite
 * @description Product Listing Page loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  if (req.url.includes("_frsh")) {
    return null;
  }

  const { resultsPerPage, showOnlyAvailable, user, hotsiteName } = props;
  const { apiKey, origin, salesChannel, api, cdn } = ctx;
  const deviceId = getDeviceIdFromBag(ctx);
  const source = getSource(ctx);
  const url = new URL(req.url);

  const page = props.page ||
    Number.parseInt(url.searchParams.get("page") || "1");
  const sortBy = getSortFromQuery(url.searchParams.get("sort") ?? "") ||
    props.sort;
  const filter = url.searchParams.getAll("filter");
  const userId = user?.["@id"];
  const productFormat = "complete";

  const response = await api["GET /engage/search/v3/hotsites"]({
    apiKey,
    origin,
    salesChannel,
    deviceId,
    showOnlyAvailable,
    resultsPerPage,
    page,
    sortBy,
    filter,
    source,
    userId,
    productFormat,
    name: hotsiteName,
  }).then((res) => res.json());

  return toProductListingPage(response, page, resultsPerPage, req.url, cdn);
};

export default loader;

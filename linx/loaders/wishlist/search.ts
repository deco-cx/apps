import { SearchWishlistResponse } from "../../utils/types/wishlistJSON.ts";
import type { AppContext } from "../../../linx/mod.ts";
import { toLinxHeaders } from "../../utils/headers.ts";

export interface Props {
  Page: {
    PageIndex: number
    PageSize: number
  }
  Where: string
  WhereMetadata: string
  OrderBy: string
}

/**
 * @title Linx Integration
 * @description Search Wishlist loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<SearchWishlistResponse | null> => {
  const { layer } = ctx;

  const response = await layer["POST /v1/Profile/API.svc/web/SearchWishlist"]({}, {
    body: props,
    headers: toLinxHeaders(req.headers),
  });

  if (response === null) {
    return null;
  }

  const result = await response.json();

  return result;
};

export default loader;

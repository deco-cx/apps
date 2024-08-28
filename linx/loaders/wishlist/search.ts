import { SearchWishlistResponse } from "../../utils/types/wishlistJSON.ts";
import type { AppContext } from "../../../linx/mod.ts";
import { toLinxHeaders } from "../../utils/headers.ts";

export interface Props {
  Page?: {
    PageIndex: number;
    PageSize: number;
  };
  OrderBy?: string;
}

const defaultProps = {
  Page: {
    PageIndex: 0,
    PageSize: 20,
  },
};

/**
 * @title Linx Integration
 * @description Search Wishlist loader
 */
const loader = async (
  { ...props }: Props,
  req: Request,
  ctx: AppContext,
): Promise<SearchWishlistResponse | null> => {
  const { layer } = ctx;
  const user = await ctx.invoke.linx.loaders.user();

  if (!user) {
    return null;
  }

  const { CustomerID } = user;

  if (!CustomerID) {
    return null;
  }

  const response = await layer["POST /v1/Profile/API.svc/web/SearchWishlist"](
    {},
    {
      body: {
        ...defaultProps,
        ...props,
        Where: `CustomerID == ${CustomerID}`,
      },
      headers: toLinxHeaders(req.headers),
    },
  );

  if (response === null) {
    return null;
  }

  const result = await response.json();

  return result;
};

export default loader;

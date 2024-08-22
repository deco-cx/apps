import { nullOnNotFound } from "../../../utils/http.ts";
import type { AppContext } from "../../mod.ts";
import { DeleteProductsFromWishlistResponse } from "../../utils/types/wishlistJSON.ts";

export interface Props {
  WishlistID: number;
  WishlistProductIDs: number[];
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DeleteProductsFromWishlistResponse | null> => {
  const { layer } = ctx;

  const user = await ctx.invoke.linx.loaders.user();

  if (!user) {
    return null;
  }

  const { CustomerID } = user;

  if (!CustomerID) {
    return null;
  }

  const response = await layer
    ["POST /v1/Profile/API.svc/web/DeleteProductsFromWishlist"](
      {},
      {
        body: {
          ...props,
          CustomerID,
        },
      },
    );

  const data = await response.json().catch(nullOnNotFound);

  if (!data) {
    return null;
  }

  return data;
};

export default action;

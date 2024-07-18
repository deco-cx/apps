import { nullOnNotFound } from "../../../utils/http.ts";
import type { AppContext } from "../../mod.ts";
import { DeleteWishlistResponse } from "../../utils/types/wishlistJSON.ts";

export interface Props {
  WishlistID: number;
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DeleteWishlistResponse | null> => {
  const { layer } = ctx;

  const response = await layer["POST /v1/Profile/API.svc/web/DeleteWishlist"](
    {},
    {
      body: props,
    },
  );

  const data = await response.json().catch(nullOnNotFound);

  if (!data) {
    return null;
  }

  return data;
};

export default action;

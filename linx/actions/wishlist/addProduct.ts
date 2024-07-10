import { nullOnNotFound } from "../../../utils/http.ts";
import type { AppContext } from "../../mod.ts";

export interface Props {
    WishlistID: number;
    ProductID: number;
    Quantity: number;
    SkuID: number;
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<unknown | null> => {
  const { api } = ctx;

  const response = await api["POST /Profile/Wishlist/AddProductToWishlist"](props, {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
  });

  const data = await response.json().catch(nullOnNotFound);

  if (!data) {
    return null;
  }
  
  return data;
};

export default action;

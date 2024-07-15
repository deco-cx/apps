import { nullOnNotFound } from "../../../utils/http.ts";
import type { AppContext } from "../../mod.ts";

export interface Props {
  WishlistID: number
  CustomerID: number
  WishlistProducts: {
    ProductID: number
    SkuID?: number
    WebSiteID?: number
    Quantity?: number
    QuantityReceived?: number
    NestedItens?: string
  }[]
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<unknown | null> => {
  const { layer } = ctx;

  const response = await layer["POST /v1/Profile/API.svc/web/AddProductsToWishlist"](
    {},
    {
      body: props,
    }
  );

  const data = await response.json().catch(nullOnNotFound);

  if (!data) {
    return null;
  }

  return data;
};

export default action;

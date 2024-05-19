import type { AppContext } from "../../mod.ts";
import { toLinxHeaders } from "../../utils/headers.ts";
import { toCart } from "../../utils/transform.ts";
import { CartProduct } from "../../utils/types/basket.ts";
import type { CartResponse } from "../../utils/types/basketJSON.ts";

export interface Props {
  BaseUrl?: string;
  WebSiteID?: number;
  FeatureID?: number;
  Products: CartProduct[];
  QueryString?: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CartResponse | null> => {
  const response = await ctx.api["POST /web-api/v1/Shopping/Basket/AddProduct"](
    {},
    {
      body: props,
      headers: toLinxHeaders(req.headers),
    },
  ).then((res) => res.json());

  if (!response.IsValid) {
    console.error("Could not add Item to cart: ", response.Errors);
    return null;
  }

  const cart = await ctx.invoke("linx/loaders/cart.ts");

  return toCart({
    ...cart,
    Shopper: response.Shopper,
  } as CartResponse, { cdn: ctx.cdn });
};

export default action;

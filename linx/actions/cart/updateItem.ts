import type { AppContext } from "../../mod.ts";
import { toLinxHeaders } from "../../utils/headers.ts";
import type { CartResponse } from "../../utils/types/basketJSON.ts";

export interface Props {
  BasketItemID: number;
  Quantity: number;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CartResponse | null> => {
  const response = props.Quantity > 0
    ? await ctx.api["POST /web-api/v1/Shopping/Basket/UpdateBasketItem"]({}, {
      body: props,
      headers: toLinxHeaders(req.headers),
    }).then((res) => res.json())
    : await ctx.api["POST /web-api/v1/Shopping/Basket/RemoveBasketItem"]({}, {
      body: props,
      headers: toLinxHeaders(req.headers),
    }).then((res) => res.json());

  if (!response.IsValid) {
    console.error("Error Updating cart item", response.Errors);
    return null;
  }

  const cart = await ctx.invoke("linx/loaders/cart.ts");

  return cart;
};

export default action;

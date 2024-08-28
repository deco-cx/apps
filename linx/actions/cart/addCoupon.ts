import type { AppContext } from "../../mod.ts";
import { toLinxHeaders } from "../../utils/headers.ts";
import type { CartResponse } from "../../utils/types/basketJSON.ts";

export interface Props {
  CouponCode: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CartResponse | null> => {
  const response = await ctx.api["POST /web-api/v1/Shopping/Basket/AddCoupon"](
    {},
    {
      body: props,
      headers: toLinxHeaders(req.headers),
    },
  ).then((res) => res.json());

  if (!response.IsValid) {
    console.error("Error adding coupon", response.Errors);
    return null;
  }

  const cart = await ctx.invoke("linx/loaders/cart.ts");

  return cart;
};

export default action;

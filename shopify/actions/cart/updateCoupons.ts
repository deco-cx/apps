import { getCookies } from "std/http/mod.ts";
import { AppContext } from "../../mod.ts";
import { SHOPIFY_COOKIE_NAME } from "../../utils/constants.ts";
import type { Cart } from "../../utils/types.ts";

type AddCouponProps = {
  discountCodes: string[];
};

const action = async (
  props: AddCouponProps,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { client } = ctx;

  const reqCookies = getCookies(req.headers);
  const cartId = reqCookies[SHOPIFY_COOKIE_NAME];
  const response = await client.cart.addCoupon({
    cartId: cartId,
    discountCodes: [...props.discountCodes],
  });

  return response?.cartDiscountCodesUpdate || { cart: { id: cartId } };
};

export default action;

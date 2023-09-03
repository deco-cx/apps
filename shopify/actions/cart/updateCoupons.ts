import { AppContext } from "../../mod.ts";
import { getCartCookie, setCartCookie } from "../../utils/cart.ts";
import { Data as CartData } from "../../utils/queries/cart.ts";
import { Data, Variables, query } from "../../utils/queries/updateCoupon.ts";

type AddCouponProps = {
  discountCodes: string[];
};

const action = async (
  props: AddCouponProps,
  req: Request,
  ctx: AppContext,
): Promise<CartData["cart"]> => {
  const { storefront } = ctx;
  const cartId = getCartCookie(req.headers);

  if (!cartId) {
    throw new Error("Missing cart id");
  }

  const { payload: { cart } } = await storefront.query<Data, Variables>({
    variables: { cartId, discountCodes: props.discountCodes },
    query,
  });

  setCartCookie(ctx.response.headers, cartId);

  return cart;
};

export default action;

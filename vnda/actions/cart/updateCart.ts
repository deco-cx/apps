import { HttpError } from "../../../utils/http.ts";
import cartLoader, { Cart } from "../../loaders/cart.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";

export interface Props {
  agent?: string;
  zip?: string;
  client_id?: number;
  coupon_code?: string;
  rebate_token?: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { api } = ctx;
  const cartId = getCartCookie(req.headers);

  if (!cartId) {
    throw new HttpError(400, "Missing cart cookie");
  }

  await api["PATCH /api/v2/carts/:cartId"]({ cartId }, { body: props });

  return cartLoader({}, req, ctx);
};

export default action;
